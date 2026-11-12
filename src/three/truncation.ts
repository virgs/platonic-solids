import type { PlatonicId, SolidId } from '../data/solids'
import type { Polyhedron } from './transformations'
import { cutCorners } from './cutCorners'
import { Vector3 } from 'three'
import { ConvexGeometry } from 'three/examples/jsm/geometries/ConvexGeometry.js'
import { extractGeometry } from './geometry'

export const truncationTargets: Partial<Record<SolidId,SolidId>> = {
  tetrahedron: 'truncated-tetrahedron', cube: 'truncated-cube', octahedron: 'truncated-octahedron',
  dodecahedron: 'truncated-dodecahedron', icosahedron: 'truncated-icosahedron',
}
export const truncationParents: Partial<Record<SolidId,PlatonicId>> = {
  'truncated-tetrahedron': 'tetrahedron', 'truncated-cube': 'cube', 'truncated-octahedron': 'octahedron',
  'truncated-dodecahedron': 'dodecahedron', 'truncated-icosahedron': 'icosahedron',
}
export function truncationFraction(id: PlatonicId) {
  const sides = id === 'cube' ? 4 : id === 'dodecahedron' ? 5 : 3
  return 1/(2+2*Math.cos(Math.PI/sides))
}

export function truncateModel(source: Polyhedron, id: PlatonicId): Polyhedron {
  return { ...cutCorners(source,truncationFraction(id)), truncatedFrom: { id, model: source } }
}

export function recoverTruncationParent(source: Polyhedron, id: PlatonicId): Polyhedron {
  if (source.truncatedFrom?.id === id) {
    const parent=source.truncatedFrom.model, expected=cutCorners(parent,truncationFraction(id))
    if (expected.vertices.every(p=>source.vertices.some(v=>v.distanceTo(p)<1e-6))) return parent
  }
  const degree = id === 'octahedron' ? 4 : id === 'icosahedron' ? 5 : 3
  const corners = source.faces.filter(face => face.length === degree).map(face => face.reduce((sum,i) => sum.add(source.vertices[i]),new Vector3()).normalize())
  const extracted = extractGeometry(new ConvexGeometry(corners))
  return { vertices: extracted.vertices.map(p => new Vector3(...p).normalize()), faces: extracted.faces.map(face => face.vertices) }
}

/** Preserve the exact parent, including orientation, for seamless reverse playback. */
export function createTruncationPath(source: Polyhedron, from: SolidId, to: SolidId) {
  const forward = truncationTargets[from] === to
  const parent = (forward ? from : truncationParents[from]) as PlatonicId | undefined
  if (!parent || truncationTargets[parent] !== (forward ? to : from) || (!forward && to !== parent)) throw new Error('Unsupported truncation route')
  const original = forward ? source : recoverTruncationParent(source,parent)
  if (!original) throw new Error('Truncation parent geometry is missing')
  const target = forward ? truncateModel(original,parent) : original
  return { source, target, at(progress: number) {
    if (progress <= 0) return source
    if (progress >= 1) return target
    return cutCorners(original, truncationFraction(parent)*(forward ? progress : 1-progress))
  } }
}

import { Vector3 } from 'three'
import { ConvexGeometry } from 'three/examples/jsm/geometries/ConvexGeometry.js'
import type { PlatonicId, SolidId } from '../data/solids'
import type { Polyhedron } from './transformations'
import { cutCorners } from './cutCorners'
import { truncationFraction, truncationParents, truncateModel, recoverTruncationParent } from './truncation'
import { extractGeometry } from './geometry'

export const rectificationTargets: Partial<Record<SolidId,SolidId>> = {
  tetrahedron: 'octahedron', cube: 'cuboctahedron', octahedron: 'cuboctahedron',
  dodecahedron: 'icosidodecahedron', icosahedron: 'icosidodecahedron',
  'truncated-tetrahedron': 'octahedron', 'truncated-cube': 'cuboctahedron', 'truncated-octahedron': 'cuboctahedron',
  'truncated-dodecahedron': 'icosidodecahedron', 'truncated-icosahedron': 'icosidodecahedron',
}

export function rectifyModel(source: Polyhedron, id: PlatonicId): Polyhedron {
  return { ...cutCorners(source,0.5), rectifiedFrom: { id, model: source } }
}

function unrectifyModel(source: Polyhedron, id: PlatonicId): Polyhedron {
  if (source.rectifiedFrom?.id === id) return source.rectifiedFrom.model
  const degree = id === 'octahedron' ? 4 : id === 'icosahedron' ? 5 : 3
  let corners = source.faces.filter((face) => face.length === degree).map((face) => face.reduce((sum,i) => sum.add(source.vertices[i]),new Vector3()).normalize())
  if (id === 'tetrahedron') {
    const first = corners[0]
    corners = corners.filter((corner) => corner === first || Math.abs(corner.dot(first)+1/3) < 1e-5)
  }
  const model = extractGeometry(new ConvexGeometry(corners))
  return { vertices: model.vertices.map((p) => new Vector3(...p).normalize()), faces: model.faces.map((face) => face.vertices) }
}

export function createRectificationPath(source: Polyhedron, from: SolidId, to: SolidId) {
  const forward = rectificationTargets[from] === to
  const truncated = truncationParents[from] ? from : truncationParents[to] ? to : undefined
  if (truncated) {
    const parent = truncationParents[truncated]!
    if (rectificationTargets[parent] !== (forward ? to : from)) throw new Error('Unsupported continuation route')
    const original = forward ? recoverTruncationParent(source,parent) : unrectifyModel(source,parent)
    const target = forward ? rectifyModel(original,parent) : truncateModel(original,parent)
    return { source, target, at(progress: number) {
      if (progress <= 0) return source
      if (progress >= 1) return target
      const fraction = truncationFraction(parent), t = forward ? progress : 1-progress
      return cutCorners(original,fraction+(0.5-fraction)*t)
    } }
  }
  const originalId = (forward ? from : to) as PlatonicId
  if (rectificationTargets[originalId] !== (forward ? to : from)) throw new Error('Unsupported rectification route')
  const original = forward ? source : unrectifyModel(source,originalId)
  const target = forward ? rectifyModel(original,originalId) : original
  return {
    source, target,
    at(progress: number) {
      if (progress <= 0) return source
      if (progress >= 1) return target
      return cutCorners(original,(forward ? progress : 1-progress)/2)
    },
  }
}

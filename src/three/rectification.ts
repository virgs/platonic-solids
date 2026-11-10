import { Vector3 } from 'three'
import { ConvexGeometry } from 'three/examples/jsm/geometries/ConvexGeometry.js'
import type { PlatonicId, SolidId } from '../data/solids'
import type { Polyhedron } from './transformations'
import { extractGeometry } from './geometry'

export const rectificationTargets: Partial<Record<SolidId,SolidId>> = {
  tetrahedron: 'octahedron', cube: 'cuboctahedron', octahedron: 'cuboctahedron',
  dodecahedron: 'icosidodecahedron', icosahedron: 'icosidodecahedron',
}

function cutCorners(source: Polyhedron, fraction: number): Polyhedron {
  const vertices: Vector3[] = []
  const indices = new Map<string,number>()
  const add = (point: Vector3) => {
    const key = point.toArray().map((n) => Math.round(n*1e7)).join(',')
    if (!indices.has(key)) { indices.set(key,vertices.length); vertices.push(point) }
    return indices.get(key)!
  }
  const clean = (face: number[]) => [...new Set(face)]
  const neighbors = source.vertices.map(() => new Set<number>())
  const faces = source.faces.map((face) => clean(face.flatMap((v,i) => {
    const next = face[(i+1)%face.length]
    neighbors[v].add(next); neighbors[next].add(v)
    return [add(source.vertices[v].clone().lerp(source.vertices[next],fraction)),add(source.vertices[next].clone().lerp(source.vertices[v],fraction))]
  })))
  source.vertices.forEach((vertex,i) => {
    const ring = [...neighbors[i]].map((next) => vertex.clone().lerp(source.vertices[next],fraction))
    const center = ring.reduce((sum,p) => sum.add(p),new Vector3()).divideScalar(ring.length)
    const normal = vertex.clone().normalize(), u = ring[0].clone().sub(center).normalize(), v = normal.clone().cross(u)
    ring.sort((a,b) => Math.atan2(a.clone().sub(center).dot(v),a.clone().sub(center).dot(u))-Math.atan2(b.clone().sub(center).dot(v),b.clone().sub(center).dot(u)))
    faces.push(clean(ring.map(add)))
  })
  const radius = Math.max(...vertices.map((p) => p.length()))
  vertices.forEach((p) => p.divideScalar(radius))
  return { vertices, faces: faces.filter((face) => face.length >= 3) }
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

import { Vector3 } from 'three'
import type { Polyhedron } from './transformations'

export function cutCorners(source: Polyhedron, fraction: number): Polyhedron {
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


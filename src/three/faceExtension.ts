import { Vector3 } from 'three'
import type { Polyhedron } from './transformations'

function plane(points: Vector3[]) {
  const normal = points[1].clone().sub(points[0]).cross(points[2].clone().sub(points[0])).normalize()
  if (normal.dot(points[0]) < 0) normal.negate()
  return { normal, distance: normal.dot(points[0]) }
}

/** Grow convex source face regions within their planes until the target is exposed.
 * Clipping preserves the target contour's winding, including pentagram crossings.
 * A single uniform normalization keeps circumradius fixed without rotating planes.
 */
export function createFaceExtension(source: Polyhedron, target: Polyhedron) {
  const targets = target.faces.map((face) => {
    const points = face.map((v) => target.vertices[v])
    return { points, ...plane(points) }
  })
  let expansion = 1
  const regions = source.faces.map((face) => {
    const points = face.map((v) => source.vertices[v])
    const { normal, distance } = plane(points)
    const match = targets.find((candidate) => candidate.normal.dot(normal) > 1-1e-8)
    if (!match) throw new Error('Stellation must preserve the source face planes')
    const extended = match.points.map((point) => point.clone().multiplyScalar(distance/match.distance))
    const center = normal.clone().multiplyScalar(distance)
    const bounds = points.map((point,i) => {
      const direction = points[(i+1)%points.length].clone().sub(point).cross(normal).normalize()
      if (direction.dot(point.clone().sub(center)) < 0) direction.negate()
      const offset = direction.dot(point.clone().sub(center))
      expansion = Math.max(expansion,...extended.map((p) => direction.dot(p.clone().sub(center))/offset))
      return { direction, offset, center }
    })
    return { extended, bounds }
  })
  return {
    source, target,
    at(progress: number): Polyhedron {
      if (progress <= 0) return source
      if (progress >= 1) return target
      const scale = 1+(expansion-1)*progress
      const vertices: Vector3[] = []
      const faces = regions.map(({ extended,bounds }) => {
        let contour = extended
        for (const { direction, offset, center } of bounds) {
          const input = contour
          contour = []
          input.forEach((point,i) => {
            const previous = input[(i+input.length-1)%input.length]
            const d = direction.dot(point.clone().sub(center))-offset*scale
            const before = direction.dot(previous.clone().sub(center))-offset*scale
            if ((d <= 0) !== (before <= 0)) contour.push(previous.clone().lerp(point,before/(before-d)))
            if (d <= 0) contour.push(point)
          })
        }
        return contour.map((point) => { vertices.push(point.clone()); return vertices.length-1 })
      })
      const radius = Math.max(...vertices.map((v) => v.length()))
      vertices.forEach((point) => point.divideScalar(radius))
      return { vertices, faces }
    },
  }
}

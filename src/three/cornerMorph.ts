import { BufferGeometry, Float32BufferAttribute, Vector3 } from 'three'
import type { PlatonicId } from '../data/solids'
import { createSolidGeometry } from './geometry'

/** Clip the original surface by moving corner planes, retaining only its boundary. */
export function createCornerMorph(id: PlatonicId) {
  const source = createSolidGeometry(id)
  const positions = source.getAttribute('position')
  const corners: Vector3[] = []
  const faces: Vector3[][] = []
  for (let i = 0; i < positions.count; i += 3) {
    const triangle = [0, 1, 2].map((offset) => new Vector3().fromBufferAttribute(positions, i + offset))
    faces.push(triangle)
    triangle.forEach((point) => {
      if (!corners.some((corner) => corner.distanceTo(point) < 1e-5)) corners.push(point)
    })
  }
  const face = faces[0]
  const normal = face[1].clone().sub(face[0]).cross(face[2].clone().sub(face[0])).normalize()
  const inradius = Math.abs(normal.dot(face[0]))
  source.dispose()

  return (progress: number): BufferGeometry => {
    let polygons = faces.map((polygon) => polygon.map((point) => point.clone()))
    const distance = 1 + (inradius * inradius - 1) * progress
    for (const corner of corners) {
      const planeNormal = corner.clone().normalize()
      const intersections: Vector3[] = []
      const clipped: Vector3[][] = []
      for (const polygon of polygons) {
        const result: Vector3[] = []
        polygon.forEach((a, index) => {
          const b = polygon[(index + 1) % polygon.length]
          const da = planeNormal.dot(a) - distance
          const db = planeNormal.dot(b) - distance
          if (da <= 1e-7) result.push(a)
          if (Math.abs(da) <= 1e-7 && !intersections.some((point) => point.distanceTo(a) < 1e-5)) intersections.push(a.clone())
          if ((da < -1e-7 && db > 1e-7) || (da > 1e-7 && db < -1e-7)) {
            const point = a.clone().lerp(b, da / (da - db))
            result.push(point)
            if (!intersections.some((existing) => existing.distanceTo(point) < 1e-5)) intersections.push(point)
          }
        })
        if (result.length >= 3) clipped.push(result)
      }
      if (intersections.length >= 3) {
        const center = intersections.reduce((sum, point) => sum.add(point), new Vector3()).divideScalar(intersections.length)
        const u = intersections[0].clone().sub(center).normalize()
        const v = planeNormal.clone().cross(u)
        intersections.sort((a, b) => {
          const angle = (point: Vector3) => {
            const relative = point.clone().sub(center)
            return Math.atan2(relative.dot(v), relative.dot(u))
          }
          return angle(a) - angle(b)
        })
        clipped.push(intersections)
      }
      polygons = clipped
    }
    const radius = Math.max(...polygons.flat().map((point) => point.length()))
    const coordinates: number[] = []
    polygons.forEach((polygon) => {
      for (let i = 1; i < polygon.length - 1; i++) {
        const triangle = [polygon[0], polygon[i], polygon[i + 1]]
        const area = triangle[1].clone().sub(triangle[0]).cross(triangle[2].clone().sub(triangle[0])).length()
        if (area > 1e-9) triangle.forEach((point) => coordinates.push(point.x / radius, point.y / radius, point.z / radius))
      }
    })
    const geometry = new BufferGeometry()
    geometry.setAttribute('position', new Float32BufferAttribute(coordinates, 3))
    geometry.computeVertexNormals()
    geometry.computeBoundingSphere()
    return geometry
  }
}

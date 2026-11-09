import { describe, expect, it } from 'vitest'
import { Vector3 } from 'three'
import { createStarGeometry, starModels, type StarSolidId } from './starPolyhedra'
import { getSolid } from '../data/solids'

describe('Kepler–Poinsot models', () => {
  it.each(Object.keys(starModels) as StarSolidId[])('%s has reviewed topology and unit radius', (id) => {
    const source = starModels[id]
    const metadata = getSolid(id)
    expect(source.vertices.length).toBe(metadata.vertices)
    expect(source.faces.length).toBe(metadata.faces)
    const edges = new Map<string, number>()
    source.faces.forEach((face) => face.forEach((vertex,i) => {
      const key = [vertex,face[(i+1)%face.length]].sort((a,b) => a-b).join(':')
      edges.set(key,(edges.get(key) ?? 0)+1)
    }))
    expect(edges.size).toBe(metadata.edges)
    expect([...edges.values()].every((count) => count === 2)).toBe(true)
    for (const face of source.faces) {
      const points = face.map((i) => new Vector3(...source.vertices[i]))
      const normal = points[1].clone().sub(points[0]).cross(points[2].clone().sub(points[0])).normalize()
      for (const point of points) expect(Math.abs(normal.dot(point.clone().sub(points[0])))).toBeLessThan(1e-6)
    }
    const { geometry, edgeGeometry } = createStarGeometry(id)
    geometry.computeBoundingSphere()
    expect(geometry.boundingSphere!.radius).toBeCloseTo(1,5)
    expect(edgeGeometry.getAttribute('position').count).toBe(metadata.edges*2)
    geometry.dispose()
    edgeGeometry.dispose()
  })
})

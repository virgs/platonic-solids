import { describe, expect, it } from 'vitest'
import { getSolid, type SolidId } from '../data/solids'
import { loadPolyhedron, renderPolyhedron, type Polyhedron } from './transformations'
import { createStellationPath } from './stellationPaths'

function check(model: Polyhedron, id: SolidId) {
  const solid = getSolid(id)
  expect(model.vertices).toHaveLength(solid.vertices)
  expect(model.faces).toHaveLength(solid.faces)
  const edges = new Set<string>()
  const lengths: number[] = []
  model.faces.forEach((face) => face.forEach((v,i) => {
    const next = face[(i+1)%face.length]
    edges.add([v,next].sort((a,b) => a-b).join(':'))
    lengths.push(model.vertices[v].distanceTo(model.vertices[next]))
  }))
  expect(edges.size).toBe(solid.edges)
  expect(Math.max(...lengths)-Math.min(...lengths)).toBeLessThan(1e-5)
}

describe('completed D12 destinations', () => {
  it.each(['great-dodecahedron','great-stellated-dodecahedron'] as const)('%s has exact checkpoints, finite surfaces, and reversible orientation', (destination) => {
    const source = loadPolyhedron('dodecahedron')
    const path = createStellationPath(source,'dodecahedron',destination)
    const segments = path.stops.length-1
    path.stops.forEach((id,i) => check(path.at(i/segments),id))
    for (let i=0;i<=24;i++) {
      const model = path.at(i/24)
      expect(Math.max(...model.vertices.map((v) => v.length()))).toBeCloseTo(1,5)
      const rendered = renderPolyhedron(model)
      const positions = rendered.geometry.getAttribute('position')
      expect(positions.count).toBeGreaterThan(0)
      expect([...positions.array].every(Number.isFinite)).toBe(true)
      rendered.geometry.dispose(); rendered.edgeGeometry.dispose()
    }
    const reverse = createStellationPath(path.target,destination,'dodecahedron')
    check(reverse.target,'dodecahedron')
    for (const p of source.vertices) expect(Math.min(...reverse.target.vertices.map((v) => v.distanceTo(p)))).toBeLessThan(1e-5)
  })
})

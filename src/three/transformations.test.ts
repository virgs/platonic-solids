import { describe, expect, it } from 'vitest'
import { getSolid } from '../data/solids'
import { starModels, type StarSolidId } from './starPolyhedra'
import { createStarDual, createStellation, createDestellation, loadPolyhedron, renderPolyhedron, type Polyhedron } from './transformations'

function validate(model: Polyhedron, id: string) {
  const expected = getSolid(id)
  expect(model.vertices.length).toBe(expected.vertices)
  expect(model.faces.length).toBe(expected.faces)
  const edges = new Set<string>()
  const lengths: number[] = []
  for (const face of model.faces) {
    face.forEach((v,i) => {
      const next = face[(i+1)%face.length]
      edges.add([v,next].sort((a,b) => a-b).join(':'))
      lengths.push(model.vertices[v].distanceTo(model.vertices[next]))
    })
  }
  expect(edges.size).toBe(expected.edges)
  expect(Math.max(...lengths)-Math.min(...lengths)).toBeLessThan(1e-5)
  expect(Math.max(...model.vertices.map((v) => v.length()))).toBeCloseTo(1,5)
}

describe('star transformations', () => {
  it.each(Object.keys(starModels) as StarSolidId[])('%s reaches its true dual', (id) => {
    const pair = createStarDual(loadPolyhedron(id))
    validate(pair.target,getSolid(id).dualId)
    for (const t of [0,0.25,0.5,0.75,1]) {
      const model = pair.at(t)
      expect(Math.max(...model.vertices.map((v) => v.length()))).toBeCloseTo(1,5)
      const rendered = renderPolyhedron(model)
      expect(rendered.geometry.getAttribute('position').count).toBeGreaterThan(0)
      rendered.geometry.dispose(); rendered.edgeGeometry.dispose()
    }
    const roundTrip = createStarDual(pair.target).target
    expect(roundTrip.vertices.length).toBe(pair.source.vertices.length)
    for (const point of pair.source.vertices) {
      expect(Math.min(...roundTrip.vertices.map((v) => v.distanceTo(point)))).toBeLessThan(1e-5)
    }
  })

  it.each([
    ['dodecahedron','small-stellated-dodecahedron'],
    ['great-dodecahedron','great-stellated-dodecahedron'],
    ['icosahedron','great-icosahedron'],
  ] as const)('%s stellates to %s and reverses continuously', (from,to) => {
    const source = loadPolyhedron(from)
    const forward = createStellation(source)
    validate(forward.target,to)
    const reverse = createDestellation(forward.target)
    validate(reverse.target,from)
    for (const t of [0,0.25,0.5,0.75,1]) {
      const rendered = renderPolyhedron(forward.at(t))
      expect(rendered.geometry.getAttribute('position').count).toBeGreaterThan(0)
      rendered.geometry.dispose(); rendered.edgeGeometry.dispose()
    }
    for (const point of source.vertices) {
      expect(Math.min(...reverse.target.vertices.map((v) => v.distanceTo(point)))).toBeLessThan(1e-5)
    }
  })
})

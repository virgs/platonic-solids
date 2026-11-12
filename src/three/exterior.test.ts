import { describe, expect, it } from 'vitest'
import { Vector3 } from 'three'
import { exterior, renderSurface } from './exterior'
import { loadPolyhedron, type Polyhedron } from './transformations'
import { createStarDualPath } from './starDualPaths'
import { starModels, type StarSolidId } from './starPolyhedra'

function checkClosed(model: Polyhedron) {
  const edges = new Map<string,number>()
  model.faces.forEach((face) => face.forEach((a,i) => {
    const b = face[(i+1)%face.length], key = [a,b].sort((x,y) => x-y).join(':')
    edges.set(key,(edges.get(key) ?? 0)+1)
  }))
  expect([...edges.values()].filter((n) => n!==2)).toHaveLength(0)
  expect(model.vertices.length-edges.size+model.faces.length).toBe(2)
  expect(Math.max(...model.vertices.map((v) => v.length()))).toBeCloseTo(1,5)
  model.faces.forEach(([a,b,c]) => {
    const normal = model.vertices[b].clone().sub(model.vertices[a]).cross(model.vertices[c].clone().sub(model.vertices[a]))
    expect(normal.dot(model.vertices[a])).toBeGreaterThan(-1e-12)
  })
}

describe('connected exteriors', () => {
  it.each(Object.keys(starModels) as StarSolidId[])('%s has a closed exact exterior with no detached sheets', (id) => {
    const model = loadPolyhedron(id), surface = exterior(model)
    checkClosed(surface)
    const planes = model.faces.map((face) => {
      const [a,b,c] = face.map((v) => model.vertices[v])
      const normal = b.clone().sub(a).cross(c.clone().sub(a)).normalize()
      return { normal, distance: normal.dot(a) }
    })
    for (const face of surface.faces) expect(planes.some(({ normal,distance }) => face.every((v) => Math.abs(normal.dot(surface.vertices[v])-distance)<1e-5))).toBe(true)
    for (const vertex of model.vertices) expect(Math.min(...surface.vertices.map((p) => p.distanceTo(vertex)))).toBeLessThan(1e-5)
    const rendered = renderSurface(surface)
    expect(rendered.edgeGeometry.getAttribute('color').itemSize).toBe(4)
    expect([...rendered.geometry.getAttribute('position').array].every(Number.isFinite)).toBe(true)
    rendered.geometry.dispose(); rendered.edgeGeometry.dispose()
  })
  it.each(['small-stellated-dodecahedron','great-stellated-dodecahedron'] as const)('%s reshapes to its dual on a connected exterior', (id) => {
    const path = createStarDualPath(loadPolyhedron(id))
    for (const t of [0,0.25,0.5,0.75,1]) {
      const surface = path.at(t); checkClosed(surface)
      expect(surface.vertices.every((p) => p.toArray().every(Number.isFinite))).toBe(true)
    }
  })
  it('reuses the identical endpoint surface when history restores a solid', () => {
    const model = loadPolyhedron('small-stellated-dodecahedron')
    expect(exterior(model)).toBe(exterior(model))
    expect(exterior(model).vertices.some((v) => v.distanceTo(new Vector3())<1e-8)).toBe(false)
  })
})

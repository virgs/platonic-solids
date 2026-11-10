import { describe, expect, it } from 'vitest'
import { Quaternion, Vector3 } from 'three'
import { getSolid, type PlatonicId, type SolidId } from '../data/solids'
import { createRectificationPath, rectificationTargets } from './rectification'
import { loadPolyhedron, renderPolyhedron, type Polyhedron } from './transformations'

function check(model: Polyhedron, id?: SolidId) {
  const edges = new Map<string,number>(), lengths: number[] = []
  for (const face of model.faces) for (let i=0;i<face.length;i++) {
    const a = face[i], b = face[(i+1)%face.length], key = [a,b].sort((x,y) => x-y).join(':')
    edges.set(key,(edges.get(key) ?? 0)+1)
    lengths.push(model.vertices[a].distanceTo(model.vertices[b]))
  }
  expect([...edges.values()].every((n) => n===2)).toBe(true)
  expect(model.vertices.length-edges.size+model.faces.length).toBe(2)
  expect(Math.max(...model.vertices.map((p) => p.length()))).toBeCloseTo(1,5)
  if (id) {
    const solid = getSolid(id)
    expect(model.vertices).toHaveLength(solid.vertices); expect(model.faces).toHaveLength(solid.faces)
    expect(edges.size).toBe(solid.edges)
    expect(Math.max(...lengths)-Math.min(...lengths)).toBeLessThan(1e-5)
  }
}

describe('rectification', () => {
  it.each(Object.entries(rectificationTargets) as Array<[PlatonicId,SolidId]>)('%s reaches %s with a closed surface and exact reverse', (from,to) => {
    const source = loadPolyhedron(from)
    source.vertices.forEach((p) => p.applyQuaternion(new Quaternion().setFromAxisAngle(new Vector3(1,2,3).normalize(),0.53)))
    const path = createRectificationPath(source,from,to)
    check(path.target,to)
    for (const t of [0.05,0.25,0.5,0.75,0.95]) {
      const model = path.at(t); check(model)
      const rendered = renderPolyhedron(model)
      expect([...rendered.geometry.getAttribute('position').array].every(Number.isFinite)).toBe(true)
      rendered.geometry.dispose(); rendered.edgeGeometry.dispose()
    }
    const reverse = createRectificationPath(path.target,to,from)
    check(reverse.target,from)
    source.vertices.forEach((p) => expect(Math.min(...reverse.target.vertices.map((v) => v.distanceTo(p)))).toBeLessThan(1e-5))
    for (const t of [0.13,0.5,0.87]) {
      const back = reverse.at(1-t)
      path.at(t).vertices.forEach((p) => expect(Math.min(...back.vertices.map((v) => v.distanceTo(p)))).toBeLessThan(1e-5))
    }
  })
  it.each([['cuboctahedron','cube'],['cuboctahedron','octahedron'],['icosidodecahedron','dodecahedron'],['icosidodecahedron','icosahedron']] as const)('a directly selected %s can unrectify to %s', (from,to) => {
    const source = loadPolyhedron(from), path = createRectificationPath(source,from,to)
    check(path.target,to)
    const roundTrip = createRectificationPath(path.target,to,from).target
    source.vertices.forEach((p) => expect(Math.min(...roundTrip.vertices.map((v) => v.distanceTo(p)))).toBeLessThan(1e-5))
  })
})

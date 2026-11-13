import { expect, it } from 'vitest'
import { Quaternion, Vector3 } from 'three'
import { getSolid } from '../data/solids'
import { routes } from '../data/routes'
import { createExteriorMorph, exterior, surfaceRadii } from './exterior'
import { createStarDualPath } from './starDualPaths'
import { createStellationPath } from './stellationPaths'
import { loadPolyhedron } from './transformations'

const starRoutes = routes.filter(route => route.kind === 'stellate' || route.kind === 'dual' && getSolid(route.from).family === 'Kepler–Poinsot polyhedron')
const probes = Array.from({length: 160},(_,i) => {
  const z = 1-2*(i+0.5)/160, angle = i*Math.PI*(3-Math.sqrt(5)), radius = Math.sqrt(1-z*z)
  return new Vector3(radius*Math.cos(angle),radius*Math.sin(angle),z)
})

it.each(starRoutes.flatMap(route => [route,{...route,from:route.to,to:route.from}]))('$from → $to uses only the required 60, 120, or 240 surface triangles', ({kind,from,to}) => {
  const source = loadPolyhedron(from)
  source.vertices.forEach(point => point.applyQuaternion(new Quaternion().setFromAxisAngle(new Vector3(1,2,3).normalize(),0.61)))
  const path = kind === 'dual' ? createStarDualPath(source) : createStellationPath(source,from,to)
  const pyramid = kind === 'stellate' && [from,to].includes('small-stellated-dodecahedron')
  const dimples = kind === 'stellate' && [from,to].includes('great-dodecahedron') && [from,to].includes('great-stellated-dodecahedron')
  const triangles = pyramid || dimples ? 60 : [from,to].includes('great-icosahedron') ? 240 : 120
  for (const t of [0.05,0.5,0.95]) expect(path.at(t).faces).toHaveLength(triangles)
  for (const model of [source,path.target]) {
    const actual = surfaceRadii(exterior(model),probes), expected = surfaceRadii(model,probes)
    expect(Math.max(...actual.map((value,i) => Math.abs(value-expected[i])))).toBeLessThan(1e-6)
  }
  if (pyramid || dimples) return // Their direct apex-height construction has its own timing.
  const dense = createExteriorMorph(source,path.target)
  for (const t of [0.2,0.5,0.8]) {
    const actual = surfaceRadii(path.at(t),probes), expected = surfaceRadii(dense(t),probes)
    expect(Math.max(...actual.map((value,i) => Math.abs(value-expected[i])))).toBeLessThan(1e-6)
  }
})

it('twenty dimples rise linearly on one attached framework and reverse exactly', () => {
  const source = loadPolyhedron('great-dodecahedron')
  const path = createStellationPath(source,'great-dodecahedron','great-stellated-dodecahedron')
  const reverse = createStellationPath(path.target,'great-stellated-dodecahedron','great-dodecahedron')
  expect(path.mode).toBe('dimples')
  const samples = [0.1,0.3,0.5,0.7,0.9].map(t => path.at(t))
  samples.forEach((surface,i) => {
    expect(surface.vertices).toHaveLength(32)
    expect(surface.faces).toHaveLength(60)
    const base = surface.vertices[0].length()
    for (let v=0;v<12;v++) {
      expect(surface.vertices[v].clone().divideScalar(base).distanceTo(samples[0].vertices[v].clone().divideScalar(samples[0].vertices[0].length()))).toBeLessThan(1e-6)
    }
    const height = surface.vertices[12].length()/base
    if (i>1) {
      const previous = samples[i-1].vertices[12].length()/samples[i-1].vertices[0].length()
      const before = samples[i-2].vertices[12].length()/samples[i-2].vertices[0].length()
      expect(height-previous).toBeCloseTo(previous-before,6)
    }
    const back = reverse.at(1-[0.1,0.3,0.5,0.7,0.9][i])
    surface.vertices.forEach((point,v) => expect(point.distanceTo(back.vertices[v])).toBeLessThan(1e-6))
  })
  const early = path.at(0.001), late = path.at(0.999)
  const ring = [...new Set(early.faces.filter(face => face.includes(12)).flat().filter(v => v<12))]
  const direction = early.vertices[12].clone().normalize()
  const base = early.vertices[0].length()
  const flatHeight = direction.dot(early.vertices[ring[0]])/base
  const low = early.vertices[12].length()/base, high = late.vertices[12].length()/late.vertices[0].length()
  expect(low).toBeLessThan(flatHeight)
  expect(high).toBeGreaterThan(flatHeight)
  const flatTime = 0.001+(flatHeight-low)*0.998/(high-low)
  const flat = path.at(flatTime)
  for (let tip=12;tip<32;tip++) {
    const corners = [...new Set(flat.faces.filter(face => face.includes(tip)).flat().filter(v => v<12))]
    expect(corners).toHaveLength(3)
    const center = corners.reduce((sum,v) => sum.add(flat.vertices[v]),new Vector3()).divideScalar(3)
    expect(flat.vertices[tip].distanceTo(center)).toBeLessThan(1e-6)
  }
})

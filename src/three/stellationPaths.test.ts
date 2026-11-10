import { describe, expect, it } from 'vitest'
import { getSolid, type SolidId } from '../data/solids'
import { loadPolyhedron, type Polyhedron } from './transformations'
import { createStellationPath } from './stellationPaths'
import { routes } from '../data/routes'
import { Line3, Quaternion, Vector3 } from 'three'
import { exterior, renderSurface } from './exterior'

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

function surfaceArea(model: Polyhedron) {
  const rendered = renderSurface(model)
  const positions = rendered.geometry.getAttribute('position')
  let area = 0
  for (let i=0;i<positions.count;i+=3) {
    const a = new Vector3().fromBufferAttribute(positions,i)
    const b = new Vector3().fromBufferAttribute(positions,i+1)
    const c = new Vector3().fromBufferAttribute(positions,i+2)
    area += b.sub(a).cross(c.sub(a)).length()/2
  }
  rendered.geometry.dispose(); rendered.edgeGeometry.dispose()
  return area
}

function edges(model: Polyhedron) {
  const rendered = renderSurface(model)
  const positions = rendered.edgeGeometry.getAttribute('position')
  const colors = rendered.edgeGeometry.getAttribute('color')
  const result: Line3[] = []
  for (let i=0;i<positions.count;i+=2) if (!colors || colors.getW(i)>0.01) result.push(new Line3(new Vector3().fromBufferAttribute(positions,i),new Vector3().fromBufferAttribute(positions,i+1)))
  rendered.geometry.dispose(); rendered.edgeGeometry.dispose()
  return result
}

function checkEdgeContinuity(a: Polyhedron, b: Polyhedron) {
  const aa = edges(a), bb = edges(b)
  for (const [left,right] of [[aa,bb],[bb,aa]]) for (const edge of left) for (const t of [0,0.25,0.5,0.75,1]) {
    const point = edge.at(t,new Vector3())
    expect(Math.min(...right.map((other) => other.closestPointToPoint(point,true,new Vector3()).distanceTo(point)))).toBeLessThan(1e-5)
  }
}

describe('simple connected stellations', () => {
  it.each(routes.filter((route) => route.kind === 'stellate'))('$from reshapes into $to and reverses without rotating', ({ from,to }) => {
    const source = loadPolyhedron(from)
    const rotation = new Quaternion().setFromAxisAngle(new Vector3(1,2,3).normalize(),0.73)
    source.vertices.forEach((v) => v.applyQuaternion(rotation))
    const path = createStellationPath(source,from,to)
    check(path.source,from)
    check(path.target,to)
    for (let i=0;i<=24;i++) {
      const model = path.at(i/24)
      expect(Math.max(...model.vertices.map((v) => v.length()))).toBeCloseTo(1,5)
      const incidence = new Map<string,number>()
      model.faces.forEach((face) => face.forEach((a,i) => {
        const key = [a,face[(i+1)%face.length]].sort((x,y) => x-y).join(':')
        incidence.set(key,(incidence.get(key) ?? 0)+1)
      }))
      expect([...incidence].filter(([,n]) => n!==2),`${from} → ${to} at ${i}/24 has an open edge`).toHaveLength(0)
      expect(model.vertices.length-incidence.size+model.faces.length).toBe(2)
      const rendered = renderSurface(model)
      const positions = rendered.geometry.getAttribute('position')
      expect(positions.count).toBeGreaterThan(0)
      expect([...positions.array].every(Number.isFinite)).toBe(true)
      rendered.geometry.dispose(); rendered.edgeGeometry.dispose()
    }
    const reverse = createStellationPath(path.target,to,from)
    check(reverse.target,from)
    for (const p of source.vertices) expect(Math.min(...reverse.target.vertices.map((v) => v.distanceTo(p)))).toBeLessThan(1e-5)
    for (const t of [0.13,0.5,0.87]) {
      const backward = reverse.at(1-t)
      for (const p of path.at(t).vertices) expect(Math.min(...backward.vertices.map((v) => v.distanceTo(p)))).toBeLessThan(1e-5)
    }
    // The rendered surface meets both endpoints continuously, with no reveal swap.
    expect(surfaceArea(path.at(1e-7))).toBeCloseTo(surfaceArea(exterior(source)),4)
    expect(surfaceArea(path.at(1-1e-7))).toBeCloseTo(surfaceArea(exterior(path.target)),4)
    checkEdgeContinuity(path.at(1e-7),exterior(source))
    checkEdgeContinuity(path.at(1-1e-7),exterior(path.target))
  })
  it('the small stellated dodecahedron grows one pyramid from each original pentagon', () => {
    const source = loadPolyhedron('dodecahedron'), path = createStellationPath(source,'dodecahedron','small-stellated-dodecahedron')
    expect(path.mode).toBe('pyramids')
    for (const t of [0.25,0.5,0.75]) {
      const surface = path.at(t), baseScale = surface.vertices[0].length()
      expect(surface.vertices).toHaveLength(32)
      expect(surface.faces).toHaveLength(60)
      source.vertices.forEach((p,i) => expect(surface.vertices[i].clone().divideScalar(baseScale).distanceTo(p)).toBeLessThan(1e-5))
      source.faces.forEach((face,i) => {
        const normal = face.reduce((sum,v) => sum.add(source.vertices[v]),new Vector3()).normalize()
        expect(surface.vertices[20+i].clone().normalize().distanceTo(normal)).toBeLessThan(1e-5)
      })
    }
  })
})

import { expect, it } from 'vitest'
import { Quaternion, Vector3 } from 'three'
import { archimedeanSolids, getSolid } from '../data/solids'
import { createConvexDual, loadPolyhedron, type Polyhedron } from './transformations'
import { catalogMetrics } from './catalogMetrics'

function check(model: Polyhedron) {
  const metrics=catalogMetrics(model)
  expect(metrics.vertices-metrics.edges+metrics.faces).toBe(2)
  expect(Math.max(...model.vertices.map(v=>v.length()))).toBeCloseTo(1,6)
  for (const face of model.faces) {
    const a=model.vertices[face[0]], normal=model.vertices[face[1]].clone().sub(a).cross(model.vertices[face[2]].clone().sub(a)).normalize()
    const center=face.reduce((sum,i)=>sum.add(model.vertices[i]),new Vector3())
    if (normal.dot(center)<0) normal.negate()
    for (const vertex of face) expect(Math.abs(model.vertices[vertex].clone().sub(a).dot(normal))).toBeLessThan(1e-6)
    // Every frame remains one closed convex boundary, with no internal sheets.
    for (const vertex of model.vertices) expect(vertex.clone().sub(a).dot(normal)).toBeLessThan(1e-6)
  }
}

it.each(archimedeanSolids)('$name reaches its true Catalan dual and reverses without changing orientation', solid=>{
  const source=loadPolyhedron(solid.id)
  const rotation=new Quaternion().setFromAxisAngle(new Vector3(1,2,3).normalize(),0.39)
  source.vertices.forEach(v=>v.applyQuaternion(rotation))
  const path=createConvexDual(source), definition=getSolid(solid.dualId!), reverse=createConvexDual(path.target)
  expect(path.target.vertices).toHaveLength(definition.vertices)
  expect(path.target.faces).toHaveLength(definition.faces)
  expect(reverse.target).toBe(source)
  for (const t of [0,0.001,0.2,0.5,0.8,0.999,1]) {
    const model=path.at(t)
    check(model)
    const back=reverse.at(1-t)
    model.vertices.forEach(v=>expect(Math.min(...back.vertices.map(p=>p.distanceTo(v)))).toBeLessThan(1e-6))
  }
})

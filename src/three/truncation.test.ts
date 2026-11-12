import { describe, expect, it } from 'vitest'
import { Quaternion, Vector3 } from 'three'
import { getSolid, type PlatonicId, type SolidId } from '../data/solids'
import { createTruncationPath, truncationTargets } from './truncation'
import { modelEdges } from './highlights'
import { loadPolyhedron, type Polyhedron } from './transformations'

function check(model: Polyhedron, id?: SolidId) {
  const edges = modelEdges(model)
  expect(model.vertices.length - edges.length + model.faces.length).toBe(2)
  expect(Math.max(...model.vertices.map(p => p.length()))).toBeCloseTo(1,6)
  const occurrences = new Map<string,number>()
  for (const face of model.faces) {
    const a=model.vertices[face[0]], normal=model.vertices[face[1]].clone().sub(a).cross(model.vertices[face[2]].clone().sub(a)).normalize()
    for (const vertex of face) expect(Math.abs(model.vertices[vertex].clone().sub(a).dot(normal))).toBeLessThan(1e-6)
    face.forEach((v,i) => { const key=[v,face[(i+1)%face.length]].sort((a,b)=>a-b).join(':'); occurrences.set(key,(occurrences.get(key) ?? 0)+1) })
  }
  expect([...occurrences.values()].every(n=>n===2)).toBe(true)
  if (id) {
    const solid=getSolid(id), lengths=edges.map(([a,b])=>model.vertices[a].distanceTo(model.vertices[b]))
    expect(model.vertices).toHaveLength(solid.vertices)
    expect(model.faces).toHaveLength(solid.faces)
    expect(edges).toHaveLength(solid.edges)
    expect(Math.max(...lengths)-Math.min(...lengths)).toBeLessThan(1e-6)
    const normals = model.faces.map(face => {
      const a=model.vertices[face[0]], normal=model.vertices[face[1]].clone().sub(a).cross(model.vertices[face[2]].clone().sub(a)).normalize()
      const center=face.reduce((sum,i)=>sum.add(model.vertices[i]),new Vector3())
      return normal.dot(center)<0 ? normal.negate() : normal
    })
    const dihedrals = new Set(edges.map(([a,b]) => {
      const incident=model.faces.flatMap((face,i)=>face.some((v,j)=>v===a && face[(j+1)%face.length]===b || v===b && face[(j+1)%face.length]===a) ? [i] : [])
      return ((Math.PI-normals[incident[0]].angleTo(normals[incident[1]]))*180/Math.PI).toFixed(2)
    }))
    expect([...dihedrals].sort()).toEqual(solid.dihedralAngle.split(' / ').map(angle=>parseFloat(angle).toFixed(2)).sort())
    // Equal angles as well as equal edges: every endpoint face is regular.
    for (const face of model.faces) for (let i=0;i<face.length;i++) {
      const center=model.vertices[face[i]], a=model.vertices[face[(i+1)%face.length]].clone().sub(center), b=model.vertices[face[(i+face.length-1)%face.length]].clone().sub(center)
      expect(a.angleTo(b)).toBeCloseTo((face.length-2)*Math.PI/face.length,5)
    }
  }
}

describe('uniform truncation', () => {
  it.each(Object.entries(truncationTargets) as [PlatonicId,SolidId][])('%s cuts continuously to %s and retraces the exact oriented surface', (from,to) => {
    const source=loadPolyhedron(from)
    source.vertices.forEach(v=>v.applyQuaternion(new Quaternion().setFromAxisAngle(new Vector3(1,2,3).normalize(),0.47)))
    const path=createTruncationPath(source,from,to), reverse=createTruncationPath(path.target,to,from)
    check(path.target,to)
    expect(reverse.target).toBe(source)
    for (const t of [0.001,0.1,0.5,0.9,0.999]) {
      const middle=path.at(t), back=reverse.at(1-t)
      check(middle)
      middle.vertices.forEach((p,i)=>expect(p.distanceTo(back.vertices[i])).toBeLessThan(1e-6))
    }
    for (const [t,end] of [[0.00001,source],[0.99999,path.target]] as const) {
      path.at(t).vertices.forEach(p=>expect(Math.min(...end.vertices.map(v=>v.distanceTo(p)))).toBeLessThan(0.0001))
    }
  })
  it.each(Object.entries(truncationTargets) as [PlatonicId,SolidId][])('directly selected %s truncation retains a usable parent', (parent,id) => {
    const model=loadPolyhedron(id)
    check(model,id)
    check(createTruncationPath(model,id,parent).target,parent)
  })
})

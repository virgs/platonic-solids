import { expect, it } from 'vitest'
import { Quaternion, Vector3 } from 'three'
import { getSolid, starSolids } from '../data/solids'
import { createStarDualPath } from './starDualPaths'
import { exterior, renderSurface } from './exterior'
import { loadPolyhedron, type Polyhedron } from './transformations'

function area(model: Polyhedron) {
  const rendered=renderSurface(model), p=rendered.geometry.getAttribute('position')
  let sum=0
  for(let i=0;i<p.count;i+=3) {
    const a=new Vector3().fromBufferAttribute(p,i), b=new Vector3().fromBufferAttribute(p,i+1), c=new Vector3().fromBufferAttribute(p,i+2)
    sum+=b.sub(a).cross(c.sub(a)).length()/2
  }
  rendered.geometry.dispose(); rendered.edgeGeometry.dispose()
  return sum
}

it.each(starSolids)('$name reaches the exact polar dual continuously and reverses along the identical surface', solid=>{
  const source=loadPolyhedron(solid.id), rotation=new Quaternion().setFromAxisAngle(new Vector3(1,2,3).normalize(),0.43)
  source.vertices.forEach(v=>v.applyQuaternion(rotation))
  const path=createStarDualPath(source), target=getSolid(solid.dualId!), reverse=createStarDualPath(path.target)
  expect(path.target.vertices).toHaveLength(target.vertices)
  expect(path.target.faces).toHaveLength(target.faces)
  expect(reverse.target).toBe(source)
  for (const t of [0.13,0.5,0.87]) {
    const model=path.at(t), back=reverse.at(1-t), incidence=new Map<string,number>()
    model.faces.forEach(face=>face.forEach((a,i)=>{const key=[a,face[(i+1)%face.length]].sort((a,b)=>a-b).join(':');incidence.set(key,(incidence.get(key)??0)+1)}))
    expect([...incidence.values()].every(n=>n===2)).toBe(true)
    expect(model.vertices.length-incidence.size+model.faces.length).toBe(2)
    model.vertices.forEach((v,i)=>expect(v.distanceTo(back.vertices[i])).toBeLessThan(1e-6))
  }
  expect(area(path.at(1e-7))).toBeCloseTo(area(exterior(source)),4)
  expect(area(path.at(1-1e-7))).toBeCloseTo(area(exterior(path.target)),4)
  expect(path.at(0)).toBe(exterior(source))
  expect(path.at(1)).toBe(exterior(path.target))
})

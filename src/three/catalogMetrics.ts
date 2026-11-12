import { Vector3 } from 'three'
import type { Polyhedron } from './transformations'

/** Derive metrics for nonregular, face-transitive Catalan models. */
export function catalogMetrics(model: Polyhedron) {
  const edges = new Map<string,number[]>(), degrees = model.vertices.map(() => 0)
  const angles: number[] = []
  const normals = model.faces.map((face,f) => {
    const a=model.vertices[face[0]], normal=model.vertices[face[1]].clone().sub(a).cross(model.vertices[face[2]].clone().sub(a)).normalize()
    const center=face.reduce((sum,i)=>sum.add(model.vertices[i]),new Vector3())
    face.forEach((v,i) => {
      degrees[v]++
      const next=face[(i+1)%face.length], prev=face[(i+face.length-1)%face.length]
      const key=[v,next].sort((a,b)=>a-b).join(':')
      edges.set(key,[...(edges.get(key) ?? []),f])
      angles.push(model.vertices[next].clone().sub(model.vertices[v]).angleTo(model.vertices[prev].clone().sub(model.vertices[v]))*180/Math.PI)
    })
    return normal.dot(center)<0 ? normal.negate() : normal
  })
  const format = (values: number[]) => [...new Set(values.map(n=>Number(n.toFixed(2))))].sort((a,b)=>a-b).map(n=>`${n.toFixed(2)}°`).join(' / ')
  return {
    faces: model.faces.length, edges: edges.size, vertices: model.vertices.length,
    faceAngle: format(angles),
    dihedralAngle: format([...edges.values()].map(([a,b])=>(Math.PI-normals[a].angleTo(normals[b]))*180/Math.PI)),
    vertexConfiguration: [...new Set(degrees)].sort((a,b)=>a-b).join(' / ')+' faces',
  }
}

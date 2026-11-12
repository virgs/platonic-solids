import { expect, it } from 'vitest'
import { routes } from '../data/routes'
import { getSolid } from '../data/solids'
import { loadPolyhedron } from './transformations'
import { createStarDualPath } from './starDualPaths'
import { createStellationPath } from './stellationPaths'

const surfaceRoutes = routes.filter(route=>route.kind==='stellate' || route.kind==='dual' && getSolid(route.from).family==='Kepler–Poinsot polyhedron')
const directions=surfaceRoutes.flatMap(route=>[route,{...route,from:route.to,to:route.from}])

it.each(directions)('$kind: $from → $to keeps planar subdivisions and avoids repeated surface reversals', ({kind,from,to})=>{
  const source=loadPolyhedron(from)
  const path=kind==='dual' ? createStarDualPath(source) : createStellationPath(source,from,to)
  const frames=Array.from({length:9},(_,i)=>path.at((i+1)/10))
  const seams: Array<{progress:number;angle:number}> = []
  for (const [index,surface] of frames.entries()) {
    expect(Math.max(...surface.vertices.map(v=>v.length()))).toBeCloseTo(1,6)
    if (!surface.edgeOpacities) continue // Explicit pyramid facets have no angular subdivision grid.
    const normals=surface.faces.map(([a,b,c])=>surface.vertices[b].clone().sub(surface.vertices[a]).cross(surface.vertices[c].clone().sub(surface.vertices[a])).normalize())
    const adjacency=new Map<string,number[]>()
    surface.faces.forEach((face,f)=>face.forEach((a,i)=>{
      const key=[a,face[(i+1)%face.length]].sort((a,b)=>a-b).join(':')
      adjacency.set(key,[...(adjacency.get(key)??[]),f])
    }))
    expect(surface.vertices.length-adjacency.size+surface.faces.length).toBe(2)
    let edge=0
    for (const faces of adjacency.values()) {
      expect(faces).toHaveLength(2)
      if (surface.edgeOpacities[edge]===0) {
        const angle=normals[faces[0]].angleTo(normals[faces[1]])
        if (angle>0.001) seams.push({progress:(index+1)/10,angle})
      }
      edge++
    }
  }
  // Hidden tessellation edges must never become ridges that boil under flat shading.
  expect(seams).toEqual([])
  const reversals:number[]=[]
  for (let v=0;v<frames[0].vertices.length;v++) {
    const radii=frames.map(frame=>frame.vertices[v].length()/frame.vertices[0].length())
    const signs=new Set(radii.slice(1).map((r,i)=>r-radii[i]).filter(delta=>Math.abs(delta)>1e-7).map(Math.sign))
    if (signs.size>1) reversals.push(v)
  }
  // Ratios cancel uniform circumradius normalization; individual regions do not pulse back and forth.
  expect(reversals).toEqual([])
})

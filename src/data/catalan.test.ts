import { expect, it } from 'vitest'
import { getSolid, type SolidId } from './solids'
import { loadPolyhedron } from '../three/transformations'

// Independent reference counts and angles: David McCooey's Catalan catalog.
it.each([
  ['rhombic-dodecahedron',12,24,14,'120.00°'],
  ['rhombic-triacontahedron',30,60,32,'144.00°'],
  ['triakis-tetrahedron',12,18,8,'129.52°'],
  ['triakis-octahedron',24,36,14,'147.35°'],
  ['tetrakis-hexahedron',24,36,14,'143.13°'],
  ['triakis-icosahedron',60,90,32,'160.61°'],
  ['pentakis-dodecahedron',60,90,32,'156.72°'],
] as const)('%s agrees with the reviewed Catalan metrics', (id,faces,edges,vertices,dihedral)=>{
  const solid=getSolid(id), model=loadPolyhedron(id as SolidId)
  expect([solid.faces,solid.edges,solid.vertices,solid.dihedralAngle]).toEqual([faces,edges,vertices,dihedral])
  expect(solid.family).toBe('Catalan solid')
  expect(getSolid(solid.dualId!).dualId).toBe(id)
  const faceLengths=model.faces.map(face=>face.map((v,i)=>model.vertices[v].distanceTo(model.vertices[face[(i+1)%face.length]])).sort((a,b)=>a-b))
  // Every face is congruent, though the triangles need not be equilateral.
  faceLengths.forEach(lengths=>lengths.forEach((length,i)=>expect(length).toBeCloseTo(faceLengths[0][i],5)))
  expect(Math.max(...model.vertices.map(v=>v.length()))-Math.min(...model.vertices.map(v=>v.length()))).toBeGreaterThan(0.001)
})

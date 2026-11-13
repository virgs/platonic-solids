import { Vector3 } from 'three'
import { ConvexGeometry } from 'three/examples/jsm/geometries/ConvexGeometry.js'
import { extractGeometry } from './geometry'
import type { Polyhedron } from './transformations'

export interface AngularMesh { directions: Vector3[]; faces: number[][] }

function hull(points: Vector3[]): Polyhedron {
  const model = extractGeometry(new ConvexGeometry(points))
  return { vertices: model.vertices.map(point => new Vector3(...point)), faces: model.faces.map(face => face.vertices) }
}

/** Recover the oriented icosahedral framework, including after arbitrary orbits
 * and chained operations. Twelve tips supply it directly; twenty tips supply
 * its dual dodecahedral hull, whose face centers give the twelve directions.
 */
function framework(models: Polyhedron[]) {
  const reference = models.find(model => model.vertices.length === 12) ?? models[0]
  let core = hull(reference.vertices.map(point => point.clone().normalize()))
  if (core.vertices.length === 20) {
    core = hull(core.faces.map(face => face.reduce((sum,v) => sum.add(core.vertices[v]),new Vector3()).normalize()))
  }
  if (core.vertices.length !== 12 || core.faces.length !== 20 || core.faces.some(face => face.length !== 3)) {
    throw new Error('A regular star surface needs an icosahedral framework')
  }
  return core
}

/** 60 attached pyramid sides, 120 symmetry sectors, or 240 sectors retaining
 * the great icosahedron's extra ridges. No global angular arrangement is needed.
 */
export function starMesh(models: Polyhedron[], pyramids = false): AngularMesh {
  const core = framework(models)
  const refined = models.some(model => model.vertices.length === 12 && model.faces.length === 20 && model.faces.every(face => face.length === 3))
  const directions = core.vertices.map(point => point.clone().normalize())
  const centers = core.faces.map(face => {
    const index = directions.length
    directions.push(face.reduce((sum,v) => sum.add(core.vertices[v]),new Vector3()).normalize())
    return index
  })
  const faces: number[][] = [], midpoints = new Map<string,number>(), goldenPoints = new Map<string,number>()
  const phi = (1+Math.sqrt(5))/2
  const midpoint = (a: number,b: number) => {
    const key = [a,b].sort((a,b) => a-b).join(':')
    if (!midpoints.has(key)) {
      midpoints.set(key,directions.length)
      directions.push(core.vertices[a].clone().add(core.vertices[b]).normalize())
    }
    return midpoints.get(key)!
  }
  const goldenPoint = (a: number,b: number) => {
    const key = `${a}:${b}`
    if (!goldenPoints.has(key)) {
      goldenPoints.set(key,directions.length)
      directions.push(core.vertices[a].clone().multiplyScalar(phi).add(core.vertices[b]).normalize())
    }
    return goldenPoints.get(key)!
  }
  core.faces.forEach((face,f) => face.forEach((a,i) => {
    const b = face[(i+1)%face.length], center = centers[f]
    if (pyramids) { faces.push([a,b,center]); return }
    const middle = midpoint(a,b)
    if (refined) {
      const nearA = goldenPoint(a,b), nearB = goldenPoint(b,a)
      faces.push([a,nearA,center],[nearA,middle,center],[middle,nearB,center],[nearB,b,center])
    } else faces.push([a,middle,center],[middle,b,center])
  }))
  return { directions, faces }
}

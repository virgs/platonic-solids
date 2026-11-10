import { BufferGeometry, Float32BufferAttribute, Vector3 } from 'three'
import libtess from 'libtess'
import { extractPolyhedron } from './geometry'
import { starModels, type StarSolidId } from './starPolyhedra'
import type { SolidId, PlatonicId } from '../data/solids'

export interface Polyhedron { vertices: Vector3[]; faces: number[][] }
export type TransformationKind = 'dual' | 'stellate'
export const stellationTargets: Partial<Record<SolidId, SolidId>> = {
  dodecahedron: 'small-stellated-dodecahedron',
  'small-stellated-dodecahedron': 'dodecahedron',
  'great-dodecahedron': 'great-stellated-dodecahedron',
  'great-stellated-dodecahedron': 'great-dodecahedron',
}

export function loadPolyhedron(id: SolidId): Polyhedron {
  if (id in starModels) {
    const model = starModels[id as StarSolidId]
    return { vertices: model.vertices.map((v) => new Vector3(...v).normalize()), faces: model.faces.map((f) => [...f]) }
  }
  const model = extractPolyhedron(id as PlatonicId)
  return { vertices: model.vertices.map((v) => new Vector3(...v)), faces: model.faces.map((f) => f.vertices) }
}

function normalize(model: Polyhedron): Polyhedron {
  const radius = Math.max(...model.vertices.map((v) => v.length()))
  return { vertices: model.vertices.map((v) => v.clone().divideScalar(radius)), faces: model.faces }
}

function faceNormal(points: Vector3[]) {
  for (let i = 1; i < points.length - 1; i++) {
    const normal = points[i].clone().sub(points[0]).cross(points[i+1].clone().sub(points[0]))
    if (normal.length() > 1e-8) return normal.normalize()
  }
  return new Vector3()
}

/** Nonzero winding fills a pentagram's center once, even as its edges intersect. */
export function renderPolyhedron(model: Polyhedron) {
  const triangles: number[] = []
  const edges: number[] = []
  const seen = new Set<string>()
  for (const face of model.faces) {
    const points = face.map((i) => model.vertices[i])
    if (faceNormal(points).lengthSq() < 0.5) continue
    const tess = new libtess.GluTesselator()
    tess.gluTessProperty(libtess.gluEnum.GLU_TESS_WINDING_RULE, libtess.windingRule.GLU_TESS_WINDING_NONZERO)
    tess.gluTessCallback(libtess.gluEnum.GLU_TESS_VERTEX, (point: number[]) => triangles.push(...point))
    tess.gluTessCallback(libtess.gluEnum.GLU_TESS_COMBINE, (point: number[]) => point)
    tess.gluTessCallback(libtess.gluEnum.GLU_TESS_EDGE_FLAG, () => undefined)
    tess.gluTessCallback(libtess.gluEnum.GLU_TESS_ERROR, (code: number) => { throw new Error(`Face tessellation failed: ${code}`) })
    tess.gluTessBeginPolygon(null)
    tess.gluTessBeginContour()
    points.forEach((point) => tess.gluTessVertex(point.toArray(), point.toArray()))
    tess.gluTessEndContour()
    tess.gluTessEndPolygon()
    points.forEach((point, i) => {
      const next = points[(i+1)%points.length]
      if (point.distanceTo(next) < 1e-6) return
      const keyPoint = (p: Vector3) => p.toArray().map((v) => Math.round(v*1e5)).join(',')
      const key = [keyPoint(point),keyPoint(next)].sort().join(':')
      if (!seen.has(key)) { edges.push(...point.toArray(),...next.toArray()); seen.add(key) }
    })
  }
  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new Float32BufferAttribute(triangles,3))
  geometry.computeVertexNormals()
  geometry.computeBoundingSphere()
  const edgeGeometry = new BufferGeometry()
  edgeGeometry.setAttribute('position', new Float32BufferAttribute(edges,3))
  return { geometry, edgeGeometry }
}

export function dualModel(source: Polyhedron): Polyhedron {
  const vertices = source.faces.map((face) => {
    const points = face.map((i) => source.vertices[i])
    const normal = faceNormal(points)
    return normal.divideScalar(normal.dot(points[0]))
  })
  const faces = source.vertices.map((_, vertex) => {
    const adjacency = new Map<number, number[]>()
    const edgeFaces = new Map<number, number[]>()
    source.faces.forEach((face, f) => {
      const i = face.indexOf(vertex)
      if (i < 0) return
      for (const neighbor of [face[(i+1)%face.length],face[(i+face.length-1)%face.length]]) {
        edgeFaces.set(neighbor,[...(edgeFaces.get(neighbor) ?? []),f])
      }
    })
    edgeFaces.forEach(([a,b]) => {
      adjacency.set(a,[...(adjacency.get(a) ?? []),b])
      adjacency.set(b,[...(adjacency.get(b) ?? []),a])
    })
    const ordered = [[...adjacency.keys()][0]]
    while (ordered.length < adjacency.size) {
      const next = adjacency.get(ordered.at(-1)!)!.find((f) => !ordered.includes(f))
      if (next === undefined) throw new Error('Invalid vertex circuit')
      ordered.push(next)
    }
    return ordered
  })
  return normalize({ vertices, faces })
}

export function createStarDual(source: Polyhedron) {
  const target = dualModel(source)
  const flags: Array<[number, number]> = []
  const flagIndex = new Map<string, number>()
  source.faces.forEach((face,f) => face.forEach((v) => { flagIndex.set(`${v}:${f}`,flags.length); flags.push([v,f]) }))
  const sourceFaces = source.faces.map((face,f) => face.map((v) => flagIndex.get(`${v}:${f}`)!))
  const targetFaces = target.faces.map((face,v) => face.map((f) => flagIndex.get(`${v}:${f}`)!))
  const edgeMap = new Map<string, { a: number; b: number; faces: number[] }>()
  source.faces.forEach((face,f) => face.forEach((a,i) => {
    const b = face[(i+1)%face.length]
    const key = [a,b].sort((a,b) => a-b).join(':')
    const edge = edgeMap.get(key) ?? { a,b,faces: [] }
    edge.faces.push(f); edgeMap.set(key,edge)
  }))
  const quads = [...edgeMap.values()].map(({ a,b,faces: [f,g] }) => [
    flagIndex.get(`${a}:${f}`)!,flagIndex.get(`${b}:${f}`)!,flagIndex.get(`${b}:${g}`)!,flagIndex.get(`${a}:${g}`)!,
  ])
  return {
    source, target,
    at(progress: number): Polyhedron {
      if (progress === 0) return source
      if (progress === 1) return target
      return normalize({ vertices: flags.map(([v,f]) => source.vertices[v].clone().lerp(target.vertices[f],progress)), faces: [...sourceFaces,...targetFaces,...quads] })
    },
  }
}

/** Extend each pentagon edge into a tip, keeping its original central region. */
export function createStellation(source: Polyhedron) {
  const starts: Vector3[] = []
  const ends: Vector3[] = []
  const faces = source.faces.map((face) => {
    if (face.length !== 5) throw new Error('This stellation requires pentagonal faces')
    const points = face.map((i) => source.vertices[i])
    const center = points.reduce((sum,p) => sum.add(p),new Vector3()).divideScalar(5)
    const result: number[] = []
    points.forEach((point,i) => {
      result.push(starts.length); starts.push(point); ends.push(point)
      const midpoint = point.clone().add(points[(i+1)%5]).multiplyScalar(0.5)
      result.push(starts.length); starts.push(midpoint)
      ends.push(midpoint.clone().sub(center).multiplyScalar(1+Math.sqrt(5)).add(center))
    })
    return result
  })
  const target = normalize(weld({ vertices: ends, faces }))
  return { source, target, at: (progress: number) => progress === 0 ? source : progress === 1 ? target : normalize({ vertices: starts.map((p,i) => p.clone().lerp(ends[i],progress)), faces }) }
}

export function createDestellation(source: Polyhedron) {
  const vertices: Vector3[] = []
  const faces = source.faces.map((face) => {
    const ring = [0,3,1,4,2].map((i) => source.vertices[face[i]])
    const center = ring.reduce((sum,p) => sum.add(p), new Vector3()).divideScalar(5)
    return ring.map((point,i) => {
      const inner = point.clone().add(ring[(i+1)%5]).sub(center.clone().multiplyScalar(2)).divideScalar(2+Math.sqrt(5)).add(center)
      let index = vertices.findIndex((p) => p.distanceTo(inner) < 1e-5)
      if (index < 0) { index = vertices.length; vertices.push(inner) }
      return index
    })
  })
  const target = normalize({ vertices, faces })
  const forward = createStellation(target)
  return { source, target, at: (progress: number) => progress === 0 ? source : progress === 1 ? target : forward.at(1-progress) }
}

function weld(model: Polyhedron): Polyhedron {
  // Only the outer five tips are mathematical vertices of each final pentagram.
  const vertices: Vector3[] = []
  const faces = model.faces.map((face) => face.filter((_,i) => i%2 === 1).map((index) => {
    const p = model.vertices[index]
    let i = vertices.findIndex((v) => v.distanceTo(p) < 1e-5)
    if (i < 0) { i = vertices.length; vertices.push(p) }
    return i
  }))
  // Tip order around the filled outline must become the pentagram edge order.
  return { vertices, faces: faces.map((f) => [f[0],f[2],f[4],f[1],f[3]]) }
}

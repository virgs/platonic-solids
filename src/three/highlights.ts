import { BufferGeometry, Color, CylinderGeometry, Quaternion, SphereGeometry, Vector3 } from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { renderPolyhedron, type Polyhedron } from './transformations'

export type Highlight = 'faces' | 'edges' | 'vertices' | null
export const highlightColors = ['#3498db', '#f39c12', '#00bc8c', '#e74c3c', '#9b59b6', '#375a7f']

/** Give neighboring mathematical faces different colors, without showing tessellation seams. */
export function faceHighlightColors(model: Polyhedron) {
  const edgeFaces = new Map<string,number[]>()
  model.faces.forEach((face,f) => face.forEach((a,i) => {
    const key = [a,face[(i+1)%face.length]].sort((a,b) => a-b).join(':')
    edgeFaces.set(key,[...(edgeFaces.get(key) ?? []),f])
  }))
  const adjacent = model.faces.map(() => new Set<number>())
  edgeFaces.forEach(faces => faces.forEach(a => faces.forEach(b => { if (a !== b) adjacent[a].add(b) })))
  const assigned: number[] = []
  model.faces.map((_,i) => i).sort((a,b) => adjacent[b].size-adjacent[a].size).forEach(face => {
    const used = new Set([...adjacent[face]].map(i => assigned[i]))
    assigned[face] = highlightColors.findIndex((_,i) => !used.has(i))
    if (assigned[face] < 0) throw new Error('Face highlight palette exhausted')
  })
  return assigned.map(i => new Color(highlightColors[i]))
}

/** Catalog edges and vertices: crossings of star faces are not new elements. */
export function modelEdges(model: Polyhedron) {
  const edges = new Map<string, [number, number]>()
  for (const face of model.faces) face.forEach((a, i) => {
    const b = face[(i+1)%face.length]
    edges.set([a,b].sort((x,y) => x-y).join(':'), [a,b])
  })
  return [...edges.values()]
}

export function highlightGeometry(model: Polyhedron, highlight: Exclude<Highlight, null>): { geometry: BufferGeometry; edgeGeometry?: BufferGeometry } {
  if (highlight === 'faces') {
    return renderPolyhedron(model, faceHighlightColors(model))
  }
  const parts = highlight === 'vertices' ? model.vertices.map(point => new SphereGeometry(0.025,12,8).translate(...point.toArray()))
    : modelEdges(model).map(([a,b]) => {
      const start = model.vertices[a], end = model.vertices[b]
      const direction = end.clone().sub(start)
      const geometry = new CylinderGeometry(0.007,0.007,direction.length(),6)
      geometry.applyQuaternion(new Quaternion().setFromUnitVectors(new Vector3(0,1,0),direction.normalize()))
      geometry.translate(...start.clone().add(end).multiplyScalar(0.5).toArray())
      return geometry
    })
  const geometry = mergeGeometries(parts)!
  parts.forEach(part => part.dispose())
  return { geometry }
}

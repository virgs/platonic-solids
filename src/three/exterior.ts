import { BufferGeometry, Float32BufferAttribute, OctahedronGeometry, Vector3 } from 'three'
import { renderPolyhedron, type Polyhedron } from './transformations'

interface Plane { normal: Vector3; distance: number }
interface AngularMesh { directions: Vector3[]; faces: number[][] }
const exteriorCache = new WeakMap<Polyhedron,Polyhedron>()
const adjacencyCache = new WeakMap<number[][],Array<{ a: number; b: number; faces: number[] }>>()

function planes(model: Polyhedron): Plane[] {
  return model.faces.map((face) => {
    const a = model.vertices[face[0]]
    let normal = new Vector3()
    for (let i=1;i<face.length-1 && normal.lengthSq()<1e-16;i++) normal = model.vertices[face[i]].clone().sub(a).cross(model.vertices[face[i+1]].clone().sub(a))
    normal.normalize()
    if (normal.dot(a)<0) normal.negate()
    return { normal, distance: normal.dot(a) }
  }).filter((plane) => plane.distance>1e-8)
}

function convex(model: Polyhedron, boundaries = planes(model)) {
  return boundaries.every(({ normal,distance }) => model.vertices.every((point) => normal.dot(point)<=distance+1e-6))
}

/** Partition directions at projected polygon boundaries and equal-depth planes.
 * Each cell has one outer face at each endpoint, so endpoint surfaces are exact.
 */
export function angularMesh(models: Polyhedron[]): AngularMesh {
  const splitters = new Map<string,Vector3>()
  const add = (normal: Vector3) => {
    if (normal.lengthSq()<1e-16) return
    normal.normalize()
    const first = normal.toArray().reduce((a,b) => Math.abs(a)>Math.abs(b) ? a : b)
    if (first<0) normal.negate()
    if ([...splitters.values()].some((existing) => Math.abs(existing.dot(normal))>1-2e-12)) return
    splitters.set(normal.toArray().map((n) => Math.round(n*1e6)).join(','),normal)
  }
  for (const model of models) {
    const boundaries = planes(model)
    for (let i=0;i<boundaries.length;i++) for (let j=i+1;j<boundaries.length;j++) {
      add(boundaries[i].normal.clone().divideScalar(boundaries[i].distance).sub(boundaries[j].normal.clone().divideScalar(boundaries[j].distance)))
    }
    model.faces.forEach((face) => face.forEach((v,i) => add(model.vertices[v].clone().cross(model.vertices[face[(i+1)%face.length]]))))
  }
  const seed = new OctahedronGeometry(1,0), position = seed.getAttribute('position')
  let cells: Vector3[][] = []
  for (let i=0;i<position.count;i+=3) cells.push([0,1,2].map((offset) => new Vector3().fromBufferAttribute(position,i+offset)))
  seed.dispose()
  for (const [,normal] of [...splitters].sort(([a],[b]) => a.localeCompare(b))) {
    const next: Vector3[][] = []
    for (const cell of cells) {
      const distances = cell.map((p) => normal.dot(p))
      if (!distances.some((d) => d>1e-8) || !distances.some((d) => d< -1e-8)) { next.push(cell); continue }
      for (const sign of [-1,1]) {
        const polygon: Vector3[] = []
        cell.forEach((point,i) => {
          const previous = cell[(i+cell.length-1)%cell.length]
          const d = distances[i]*sign, before = distances[(i+cell.length-1)%cell.length]*sign
          if ((d>=0)!==(before>=0)) polygon.push(previous.clone().lerp(point,before/(before-d)))
          if (d>=0) polygon.push(point)
        })
        const clean = polygon.filter((p,i) => p.distanceTo(polygon[(i+polygon.length-1)%polygon.length])>1e-9)
        if (clean.length>=3) next.push(clean)
      }
    }
    cells = next
  }
  const directions: Vector3[] = [], faces: number[][] = [], indices = new Map<string,number[]>()
  const index = (point: Vector3) => {
    const direction = point.clone().normalize()
    const [x,y,z] = direction.toArray().map((n) => Math.floor(n*1e6))
    for (let dx=-1;dx<=1;dx++) for (let dy=-1;dy<=1;dy++) for (let dz=-1;dz<=1;dz++) {
      for (const existing of indices.get(`${x+dx},${y+dy},${z+dz}`) ?? []) if (directions[existing].distanceTo(direction)<1e-6) return existing
    }
    const key = `${x},${y},${z}`, result = directions.length
    indices.set(key,[...(indices.get(key) ?? []),result]); directions.push(direction)
    return result
  }
  for (const cell of cells) {
    const center = index(cell.reduce((sum,p) => sum.add(p),new Vector3()).divideScalar(cell.length))
    const ring = cell.map(index)
    ring.forEach((a,i) => {
      const b = ring[(i+1)%ring.length]
      if (a!==b && a!==center && b!==center) faces.push([center,a,b])
    })
  }
  const seen = new Set<string>()
  const uniqueFaces = faces.filter((face) => {
    const key = [...face].sort((a,b) => a-b).join(':')
    if (seen.has(key)) return false
    seen.add(key); return true
  })
  const used = [...new Set(uniqueFaces.flat())], remap = new Map(used.map((v,i) => [v,i]))
  return { directions: used.map((v) => directions[v]), faces: uniqueFaces.map((face) => face.map((v) => remap.get(v)!)) }
}

/** Furthest face intersection along each ray gives the solid's exterior. */
export function surfaceRadii(model: Polyhedron, directions: Vector3[]) {
  const boundaries = planes(model)
  if (convex(model,boundaries)) return directions.map((direction) => Math.min(...boundaries.map(({ normal,distance }) => {
    const denominator = normal.dot(direction)
    return denominator>1e-10 ? distance/denominator : Infinity
  })))
  const rendered = renderPolyhedron(model), position = rendered.geometry.getAttribute('position')
  const triangles: Array<{ edges: Vector3[]; normal: Vector3; distance: number }> = []
  for (let i=0;i<position.count;i+=3) {
    const [a,b,c] = [0,1,2].map((offset) => new Vector3().fromBufferAttribute(position,i+offset))
    const normal = b.clone().sub(a).cross(c.clone().sub(a))
    if (normal.lengthSq()<1e-18) continue
    normal.normalize()
    triangles.push({ normal, distance: normal.dot(a), edges: [a.clone().cross(b).normalize(),b.clone().cross(c).normalize(),c.clone().cross(a).normalize()] })
  }
  rendered.geometry.dispose(); rendered.edgeGeometry.dispose()
  return directions.map((direction) => {
    let radius = 0
    for (const { normal,distance,edges } of triangles) {
      const denominator = normal.dot(direction)
      if (Math.abs(denominator)<1e-10) continue
      const hit = distance/denominator
      if (hit<=radius) continue
      const aa = edges[0].dot(direction), bb = edges[1].dot(direction), cc = edges[2].dot(direction)
      if ((aa>=-2e-7 && bb>=-2e-7 && cc>=-2e-7) || (aa<=2e-7 && bb<=2e-7 && cc<=2e-7)) radius = hit
    }
    if (!Number.isFinite(radius) || radius<=0) throw new Error('The exterior must cover every direction')
    return radius
  })
}

function projected(mesh: AngularMesh, radii: number[]): Polyhedron {
  const vertices = mesh.directions.map((direction,i) => direction.clone().multiplyScalar(radii[i]))
  const radius = Math.max(...vertices.map((v) => v.length()))
  vertices.forEach((v) => v.divideScalar(radius))
  return { vertices, faces: mesh.faces }
}

export function exterior(model: Polyhedron): Polyhedron {
  const cached = exteriorCache.get(model)
  if (cached) return cached
  if (convex(model)) { exteriorCache.set(model,model); return model }
  const mesh = angularMesh([model])
  const surface = projected(mesh,surfaceRadii(model,mesh.directions))
  surface.edgeOpacities = creaseWeights(surface).map((weight) => weight>0.5 ? 1 : 0)
  exteriorCache.set(model,surface)
  return surface
}

/** One closed surface; old peaks retract while the target peaks rise. */
export function createExteriorMorph(source: Polyhedron, target: Polyhedron) {
  const mesh = angularMesh([source,target])
  const a = surfaceRadii(source,mesh.directions), b = surfaceRadii(target,mesh.directions)
  const aa = creaseWeights(projected(mesh,a)).map((weight) => weight>0.5 ? 1 : 0)
  const bb = creaseWeights(projected(mesh,b)).map((weight) => weight>0.5 ? 1 : 0)
  return (progress: number) => {
    if (progress<=0) return exterior(source)
    if (progress>=1) return exterior(target)
    // Interpolate reciprocal radius: cells sharing endpoint planes then share
    // one moving plane, rather than acquiring a faceted or curved surface.
    return { ...projected(mesh,a.map((radius,i) => 1/((1-progress)/radius+progress/b[i]))), edgeOpacities: aa.map((weight,i) => weight*(1-progress)+bb[i]*progress) }
  }
}

/** Retain the existing star-dual construction, viewing its connected exterior. */
export function createExteriorProjection(source: Polyhedron, target: Polyhedron, at: (t: number) => Polyhedron) {
  const mesh = angularMesh([source,target])
  const aa = creaseWeights(projected(mesh,surfaceRadii(source,mesh.directions))).map((weight) => weight>0.5 ? 1 : 0)
  const bb = creaseWeights(projected(mesh,surfaceRadii(target,mesh.directions))).map((weight) => weight>0.5 ? 1 : 0)
  return (progress: number) => progress<=0 ? exterior(source) : progress>=1 ? exterior(target) : {
    ...projected(mesh,surfaceRadii(at(progress),mesh.directions)), edgeOpacities: aa.map((weight,i) => weight*(1-progress)+bb[i]*progress),
  }
}

/** Grow twelve pentagonal pyramids on a dodecahedron, with no loose face sheets. */
export function createPyramidMorph(core: Polyhedron, star: Polyhedron) {
  const centers = core.faces.map((face) => face.reduce((sum,v) => sum.add(core.vertices[v]),new Vector3()).divideScalar(face.length))
  const baseRadius = surfaceRadii(star,[core.vertices[0].clone().normalize()])[0]
  const heights = surfaceRadii(star,centers.map((p) => p.clone().normalize()))
  const tips = centers.map((center,i) => center.clone().normalize().multiplyScalar(heights[i]/baseRadius))
  const faces = core.faces.flatMap((face,i) => face.map((a,j) => [a,face[(j+1)%face.length],core.vertices.length+i]))
  return (progress: number): Polyhedron => {
    if (progress<=0) return exterior(core)
    if (progress>=1) return exterior(star)
    const vertices = [...core.vertices.map((p) => p.clone()),...centers.map((center,i) => center.clone().lerp(tips[i],progress))]
    const radius = Math.max(...vertices.map((p) => p.length()))
    vertices.forEach((p) => p.divideScalar(radius))
    return { vertices, faces }
  }
}

function surfaceEdges(faces: number[][]) {
  let adjacency = adjacencyCache.get(faces)
  if (!adjacency) {
    const edges = new Map<string,{ a: number; b: number; faces: number[] }>()
    faces.forEach((face,f) => face.forEach((a,i) => {
      const b = face[(i+1)%face.length], key = [a,b].sort((x,y) => x-y).join(':')
      const edge = edges.get(key) ?? { a,b,faces: [] }
      edge.faces.push(f); edges.set(key,edge)
    }))
    adjacency = [...edges.values()]; adjacencyCache.set(faces,adjacency)
  }
  return adjacency
}

function creaseWeights(model: Polyhedron) {
  const normals = model.faces.map(([a,b,c]) => model.vertices[b].clone().sub(model.vertices[a]).cross(model.vertices[c].clone().sub(model.vertices[a])).normalize())
  return surfaceEdges(model.faces).map(({ faces }) => {
    const angle = faces.length===2 ? Math.acos(Math.max(-1,Math.min(1,normals[faces[0]].dot(normals[faces[1]])))) : Math.PI
    return angle<1e-5 ? 0 : Math.min(1,angle/0.3)
  })
}

/** Only endpoint features are drawn during surface reshaping, never the grid. */
export function renderSurface(model: Polyhedron) {
  if (!model.faces.every((face) => face.length===3)) return renderPolyhedron(model)
  const geometry = new BufferGeometry(), coordinates: number[] = []
  model.faces.forEach((face) => face.forEach((v) => coordinates.push(...model.vertices[v].toArray())))
  geometry.setAttribute('position',new Float32BufferAttribute(coordinates,3)); geometry.computeVertexNormals(); geometry.computeBoundingSphere()
  const adjacency = surfaceEdges(model.faces), weights = model.edgeOpacities ?? creaseWeights(model)
  const lines: number[] = [], colors: number[] = []
  for (let i=0;i<adjacency.length;i++) {
    const { a,b } = adjacency[i], weight = weights[i]
    if (weight<=0) continue
    lines.push(...model.vertices[a].toArray(),...model.vertices[b].toArray())
    colors.push(1,1,1,weight,1,1,1,weight)
  }
  const edgeGeometry = new BufferGeometry()
  edgeGeometry.setAttribute('position',new Float32BufferAttribute(lines,3))
  edgeGeometry.setAttribute('color',new Float32BufferAttribute(colors,4))
  return { geometry, edgeGeometry }
}

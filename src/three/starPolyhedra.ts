import { BufferGeometry, Float32BufferAttribute, Vector3 } from 'three'

// Vertex and face definitions: David McCooey, https://dmccooey.com/polyhedra/
const a = (Math.sqrt(5) - 1) / 4
const b = (3 - Math.sqrt(5)) / 4
const sharedFaces = [[0,2,7,11,5],[0,5,1,9,8],[0,8,6,7,10],[1,3,6,8,4],[1,4,0,10,11],[1,11,7,6,9],[2,0,4,9,6],[2,6,3,11,10],[2,10,5,4,8],[3,1,5,10,7],[3,7,2,8,9],[3,9,4,5,11]]

export const starModels = {
  'small-stellated-dodecahedron': {
    star: true,
    vertices: [[0,.5,-a],[0,.5,a],[0,-.5,-a],[0,-.5,a],[.5,-a,0],[-.5,-a,0],[.5,a,0],[-.5,a,0],[-a,0,.5],[-a,0,-.5],[a,0,.5],[a,0,-.5]],
    faces: sharedFaces,
  },
  'great-dodecahedron': {
    star: false,
    vertices: [[.5,0,a+.5],[.5,0,-a-.5],[-.5,0,a+.5],[-.5,0,-a-.5],[a+.5,.5,0],[a+.5,-.5,0],[-a-.5,.5,0],[-a-.5,-.5,0],[0,a+.5,.5],[0,a+.5,-.5],[0,-a-.5,.5],[0,-a-.5,-.5]],
    faces: sharedFaces,
  },
  'great-stellated-dodecahedron': {
    star: true,
    vertices: [[.5,0,b],[.5,0,-b],[-.5,0,b],[-.5,0,-b],[0,b,.5],[0,b,-.5],[0,-b,.5],[0,-b,-.5],[b,.5,0],[-b,.5,0],[b,-.5,0],[-b,-.5,0],[-a,-a,-a],[-a,-a,a],[a,-a,-a],[a,-a,a],[-a,a,-a],[-a,a,a],[a,a,-a],[a,a,a]],
    faces: [[0,2,14,4,12],[0,12,8,10,16],[0,16,6,18,2],[7,6,16,10,17],[7,17,1,3,19],[7,19,11,18,6],[9,11,19,3,15],[9,15,5,4,14],[9,14,2,18,11],[13,1,17,10,8],[13,8,12,4,5],[13,5,15,3,1]],
  },
  'great-icosahedron': {
    star: false,
    vertices: [[0,-.5,a],[0,-.5,-a],[0,.5,a],[0,.5,-a],[-.5,a,0],[.5,a,0],[-.5,-a,0],[.5,-a,0],[a,0,-.5],[a,0,.5],[-a,0,-.5],[-a,0,.5]],
    faces: [[0,2,10],[0,10,5],[0,5,4],[0,4,8],[0,8,2],[3,1,11],[3,11,7],[3,7,6],[3,6,9],[3,9,1],[2,6,7],[2,7,10],[10,7,11],[10,11,5],[5,11,1],[5,1,4],[4,1,9],[4,9,8],[8,9,6],[8,6,2]],
  },
}

export type StarSolidId = keyof typeof starModels

export function createStarGeometry(id: StarSolidId) {
  const model = starModels[id]
  const vertices = model.vertices.map((point) => new Vector3(...point).normalize())
  const triangles: number[] = []
  const edges: number[] = []
  const seen = new Set<string>()
  const emit = (a: Vector3, b: Vector3, c: Vector3) => {
    for (const point of [a,b,c]) triangles.push(...point.toArray())
  }
  for (const face of model.faces) {
    const points = face.map((index) => vertices[index])
    face.forEach((index, i) => {
      const next = face[(i+1)%face.length]
      const key = [index,next].sort((a,b) => a-b).join(':')
      if (!seen.has(key)) {
        edges.push(...vertices[index].toArray(), ...vertices[next].toArray())
        seen.add(key)
      }
    })
    if (model.star) {
      // Fill a pentagram exactly once: five tips plus its central pentagon.
      const center = points.reduce((sum,p) => sum.add(p), new Vector3()).divideScalar(5)
      const phiCubed = 2 + Math.sqrt(5)
      const ring = [0,3,1,4,2].map((i) => points[i])
      const inner = ring.map((point,i) => point.clone().add(ring[(i+1)%5]).sub(center.clone().multiplyScalar(2)).multiplyScalar(1 / phiCubed).add(center))
      ring.forEach((point,i) => emit(point,inner[i],inner[(i+4)%5]))
      for (let i=1;i<4;i++) emit(inner[0],inner[i],inner[i+1])
    } else {
      for (let i=1;i<points.length-1;i++) emit(points[0],points[i],points[i+1])
    }
  }
  const geometry = new BufferGeometry()
  geometry.setAttribute('position',new Float32BufferAttribute(triangles,3))
  geometry.computeVertexNormals()
  const edgeGeometry = new BufferGeometry()
  edgeGeometry.setAttribute('position',new Float32BufferAttribute(edges,3))
  return { geometry, edgeGeometry }
}

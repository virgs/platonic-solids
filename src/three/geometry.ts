import {
  BoxGeometry,
  BufferGeometry,
  Float32BufferAttribute,
  DodecahedronGeometry,
  IcosahedronGeometry,
  OctahedronGeometry,
  TetrahedronGeometry,
} from 'three'
import type { PlatonicId } from '../data/solids'

export function normalizeCircumradius(
  source: BufferGeometry,
  radius = 1,
): BufferGeometry {
  const geometry = source.toNonIndexed()
  const positions = geometry.getAttribute('position')
  let maximumRadius = 0

  for (let index = 0; index < positions.count; index += 1) {
    const vertexRadius = Math.hypot(
      positions.getX(index),
      positions.getY(index),
      positions.getZ(index),
    )
    maximumRadius = Math.max(maximumRadius, vertexRadius)
  }

  if (maximumRadius > 0) {
    geometry.scale(radius / maximumRadius, radius / maximumRadius, radius / maximumRadius)
  }

  geometry.computeVertexNormals()
  geometry.computeBoundingSphere()
  source.dispose()
  return geometry
}

export function createSolidGeometry(id: PlatonicId): BufferGeometry {
  const source = (() => {
    switch (id) {
      case 'tetrahedron':
        return new TetrahedronGeometry(1, 0)
      case 'cube':
        return new BoxGeometry(2, 2, 2)
      case 'octahedron':
        return new OctahedronGeometry(1, 0)
      case 'dodecahedron':
        return new DodecahedronGeometry(1, 0)
      case 'icosahedron':
        return new IcosahedronGeometry(1, 0)
    }
  })()

  return normalizeCircumradius(source)
}

interface PolygonFace {
  vertices: number[]
  center: [number, number, number]
}

export interface DualMorphGeometry {
  geometry: BufferGeometry
  sourcePositions: Float32Array
  targetPositions: Float32Array
}

function vectorKey(x: number, y: number, z: number): string {
  return `${x.toFixed(5)},${y.toFixed(5)},${z.toFixed(5)}`
}

export function extractPolyhedron(id: PlatonicId) {
  const geometry = createSolidGeometry(id)
  const positions = geometry.getAttribute('position')
  const vertices: Array<[number, number, number]> = []
  const vertexByKey = new Map<string, number>()
  const triangles: number[][] = []

  for (let triangle = 0; triangle < positions.count; triangle += 3) {
    const indices: number[] = []
    for (let offset = 0; offset < 3; offset += 1) {
      const index = triangle + offset
      const vertex: [number, number, number] = [
        positions.getX(index),
        positions.getY(index),
        positions.getZ(index),
      ]
      const key = vectorKey(...vertex)
      let vertexIndex = vertexByKey.get(key)
      if (vertexIndex === undefined) {
        vertexIndex = vertices.length
        vertexByKey.set(key, vertexIndex)
        vertices.push(vertex)
      }
      indices.push(vertexIndex)
    }
    triangles.push(indices)
  }

  geometry.dispose()
  const faceGroups = new Map<
    string,
    { vertices: Set<number>; normal: [number, number, number] }
  >()

  for (const [aIndex, bIndex, cIndex] of triangles) {
    const a = vertices[aIndex]
    const b = vertices[bIndex]
    const c = vertices[cIndex]
    const ab = [b[0] - a[0], b[1] - a[1], b[2] - a[2]]
    const ac = [c[0] - a[0], c[1] - a[1], c[2] - a[2]]
    let normal: [number, number, number] = [
      ab[1] * ac[2] - ab[2] * ac[1],
      ab[2] * ac[0] - ab[0] * ac[2],
      ab[0] * ac[1] - ab[1] * ac[0],
    ]
    const length = Math.hypot(...normal)
    normal = normal.map((value) => value / length) as [number, number, number]
    const triangleCenter: [number, number, number] = [
      (a[0] + b[0] + c[0]) / 3,
      (a[1] + b[1] + c[1]) / 3,
      (a[2] + b[2] + c[2]) / 3,
    ]
    if (normal[0] * triangleCenter[0] + normal[1] * triangleCenter[1] + normal[2] * triangleCenter[2] < 0) {
      normal = normal.map((value) => -value) as [number, number, number]
    }
    const distance = normal[0] * a[0] + normal[1] * a[1] + normal[2] * a[2]
    const planeNormalKey = normal
      .map((value) => Math.round(value * 1000) / 1000)
      .join(',')
    const key = `${planeNormalKey},${distance.toFixed(3)}`
    const group = faceGroups.get(key) ?? { vertices: new Set<number>(), normal }
    group.vertices.add(aIndex)
    group.vertices.add(bIndex)
    group.vertices.add(cIndex)
    faceGroups.set(key, group)
  }

  const faces: PolygonFace[] = [...faceGroups.values()].map((group) => {
    const unordered = [...group.vertices]
    const center: [number, number, number] = [0, 0, 0]
    for (const index of unordered) {
      center[0] += vertices[index][0] / unordered.length
      center[1] += vertices[index][1] / unordered.length
      center[2] += vertices[index][2] / unordered.length
    }
    const first = vertices[unordered[0]]
    const u = [first[0] - center[0], first[1] - center[1], first[2] - center[2]]
    const uLength = Math.hypot(...u)
    const unitU = u.map((value) => value / uLength)
    const unitV = [
      group.normal[1] * unitU[2] - group.normal[2] * unitU[1],
      group.normal[2] * unitU[0] - group.normal[0] * unitU[2],
      group.normal[0] * unitU[1] - group.normal[1] * unitU[0],
    ]
    const ordered = unordered.sort((left, right) => {
      const angle = (index: number) => {
        const point = vertices[index]
        const relative = [point[0] - center[0], point[1] - center[1], point[2] - center[2]]
        return Math.atan2(
          relative[0] * unitV[0] + relative[1] * unitV[1] + relative[2] * unitV[2],
          relative[0] * unitU[0] + relative[1] * unitU[1] + relative[2] * unitU[2],
        )
      }
      return angle(left) - angle(right)
    })
    return { vertices: ordered, center }
  })

  return { vertices, faces }
}

export function createDualMorphGeometry(id: PlatonicId): DualMorphGeometry {
  const { vertices, faces } = extractPolyhedron(id)
  const edges = new Map<string, { vertices: [number, number]; faces: number[] }>()

  faces.forEach((face, faceIndex) => {
    face.vertices.forEach((vertex, index) => {
      const next = face.vertices[(index + 1) % face.vertices.length]
      const key = vertex < next ? `${vertex}:${next}` : `${next}:${vertex}`
      const edge = edges.get(key) ?? {
        vertices: vertex < next ? [vertex, next] : [next, vertex],
        faces: [],
      }
      edge.faces.push(faceIndex)
      edges.set(key, edge)
    })
  })

  const edgeList = [...edges.values()]
  const edgeIndexByKey = new Map(
    [...edges.keys()].map((key, index) => [key, index] as const),
  )
  const dualVertices = faces.map((face) => {
    const length = Math.hypot(...face.center)
    return face.center.map((value) => value / length) as [number, number, number]
  })
  const incidentFaces = vertices.map(() => [] as number[])
  faces.forEach((face, faceIndex) => {
    face.vertices.forEach((vertex) => incidentFaces[vertex].push(faceIndex))
  })
  const dualFaceCenters = incidentFaces.map((indices) => {
    const center: [number, number, number] = [0, 0, 0]
    indices.forEach((faceIndex) => {
      center[0] += dualVertices[faceIndex][0] / indices.length
      center[1] += dualVertices[faceIndex][1] / indices.length
      center[2] += dualVertices[faceIndex][2] / indices.length
    })
    return center
  })

  const sourceNodes: Array<[number, number, number]> = [...vertices]
  const targetNodes: Array<[number, number, number]> = [...dualFaceCenters]
  edgeList.forEach((edge) => {
    const [a, b] = edge.vertices.map((index) => vertices[index])
    sourceNodes.push([(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2])
    const [left, right] = edge.faces.map((index) => dualVertices[index])
    targetNodes.push([
      (left[0] + right[0]) / 2,
      (left[1] + right[1]) / 2,
      (left[2] + right[2]) / 2,
    ])
  })
  faces.forEach((face, faceIndex) => {
    sourceNodes.push(face.center)
    targetNodes.push(dualVertices[faceIndex])
  })

  const indices: number[] = []
  const edgeOffset = vertices.length
  const faceOffset = vertices.length + edgeList.length
  faces.forEach((face, faceIndex) => {
    face.vertices.forEach((vertex, index) => {
      const next = face.vertices[(index + 1) % face.vertices.length]
      const key = vertex < next ? `${vertex}:${next}` : `${next}:${vertex}`
      const edgeNode = edgeOffset + edgeIndexByKey.get(key)!
      const faceNode = faceOffset + faceIndex
      indices.push(faceNode, vertex, edgeNode, faceNode, edgeNode, next)
    })
  })

  const sourcePositions = new Float32Array(sourceNodes.flat())
  const targetPositions = new Float32Array(targetNodes.flat())
  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new Float32BufferAttribute(sourcePositions.slice(), 3))
  geometry.setIndex(indices)
  geometry.computeVertexNormals()
  return { geometry, sourcePositions, targetPositions }
}

export function updateDualMorphGeometry(morph: DualMorphGeometry, progress: number) {
  const positions = morph.geometry.getAttribute('position')
  let maximumRadius = 0
  for (let index = 0; index < positions.count; index += 1) {
    const offset = index * 3
    const x = morph.sourcePositions[offset] + (morph.targetPositions[offset] - morph.sourcePositions[offset]) * progress
    const y = morph.sourcePositions[offset + 1] + (morph.targetPositions[offset + 1] - morph.sourcePositions[offset + 1]) * progress
    const z = morph.sourcePositions[offset + 2] + (morph.targetPositions[offset + 2] - morph.sourcePositions[offset + 2]) * progress
    positions.setXYZ(index, x, y, z)
    maximumRadius = Math.max(maximumRadius, Math.hypot(x, y, z))
  }
  const scale = maximumRadius === 0 ? 1 : 1 / maximumRadius
  for (let index = 0; index < positions.count; index += 1) {
    positions.setXYZ(index, positions.getX(index) * scale, positions.getY(index) * scale, positions.getZ(index) * scale)
  }
  positions.needsUpdate = true
  morph.geometry.computeVertexNormals()
  morph.geometry.computeBoundingSphere()
}

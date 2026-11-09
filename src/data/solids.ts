export type SolidId =
  | 'tetrahedron'
  | 'cube'
  | 'octahedron'
  | 'dodecahedron'
  | 'icosahedron'

export type SolidFamily = 'Platonic solid' | 'Kepler–Poinsot polyhedron'

export interface SolidDefinition {
  id: SolidId
  name: string
  alternateName?: string
  family: SolidFamily
  symbol: string
  faces: number
  edges: number
  vertices: number
  faceType: string
  vertexConfiguration: string
  faceAngle: string
  dihedralAngle: string
  dualId: SolidId
  symmetry: string
  description: string
  wikipediaUrl: string
}

export const solids: readonly SolidDefinition[] = [
  {
    id: 'tetrahedron',
    name: 'Tetrahedron',
    family: 'Platonic solid',
    symbol: '{3,3}',
    faces: 4,
    edges: 6,
    vertices: 4,
    faceType: 'Equilateral triangle',
    vertexConfiguration: '3.3.3',
    faceAngle: '60°',
    dihedralAngle: '70.53°',
    dualId: 'tetrahedron',
    symmetry: 'T\u2095',
    description:
      'The simplest Platonic solid, formed by four congruent triangular faces. It is its own dual.',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Tetrahedron',
  },
  {
    id: 'cube',
    name: 'Cube',
    alternateName: 'Regular hexahedron',
    family: 'Platonic solid',
    symbol: '{4,3}',
    faces: 6,
    edges: 12,
    vertices: 8,
    faceType: 'Square',
    vertexConfiguration: '4.4.4',
    faceAngle: '90°',
    dihedralAngle: '90°',
    dualId: 'octahedron',
    symmetry: 'O\u2095',
    description:
      'Six square faces meet three at each vertex. The centers of its faces form an octahedron.',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Cube',
  },
  {
    id: 'octahedron',
    name: 'Octahedron',
    alternateName: 'Regular octahedron',
    family: 'Platonic solid',
    symbol: '{3,4}',
    faces: 8,
    edges: 12,
    vertices: 6,
    faceType: 'Equilateral triangle',
    vertexConfiguration: '3.3.3.3',
    faceAngle: '60°',
    dihedralAngle: '109.47°',
    dualId: 'cube',
    symmetry: 'O\u2095',
    description:
      'Eight triangular faces meet four at each vertex. It is the dual of the cube.',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Octahedron',
  },
  {
    id: 'dodecahedron',
    name: 'Dodecahedron',
    alternateName: 'Regular dodecahedron',
    family: 'Platonic solid',
    symbol: '{5,3}',
    faces: 12,
    edges: 30,
    vertices: 20,
    faceType: 'Regular pentagon',
    vertexConfiguration: '5.5.5',
    faceAngle: '108°',
    dihedralAngle: '116.57°',
    dualId: 'icosahedron',
    symmetry: 'I\u2095',
    description:
      'Twelve pentagonal faces meet three at each vertex. Its dual is the icosahedron.',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Regular_dodecahedron',
  },
  {
    id: 'icosahedron',
    name: 'Icosahedron',
    alternateName: 'Regular icosahedron',
    family: 'Platonic solid',
    symbol: '{3,5}',
    faces: 20,
    edges: 30,
    vertices: 12,
    faceType: 'Equilateral triangle',
    vertexConfiguration: '3.3.3.3.3',
    faceAngle: '60°',
    dihedralAngle: '138.19°',
    dualId: 'dodecahedron',
    symmetry: 'I\u2095',
    description:
      'Twenty triangular faces meet five at each vertex. It has the most faces of any Platonic solid.',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Regular_icosahedron',
  },
] as const

export const plannedStarSolids = [
  'Small stellated dodecahedron',
  'Great dodecahedron',
  'Great stellated dodecahedron',
  'Great icosahedron',
] as const

export function getSolid(id: string | null): SolidDefinition {
  return solids.find((solid) => solid.id === id) ?? solids[0]
}

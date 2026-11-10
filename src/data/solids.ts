export type PlatonicId =
  | 'tetrahedron'
  | 'cube'
  | 'octahedron'
  | 'dodecahedron'
  | 'icosahedron'

export type RectifiedId = 'cuboctahedron' | 'icosidodecahedron'
export type SolidId = PlatonicId | RectifiedId | import('../three/starPolyhedra').StarSolidId

export type SolidFamily = 'Platonic solid' | 'Kepler–Poinsot polyhedron' | 'Archimedean solid'

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
  dualId?: SolidId
  dualName?: string
  faceBreakdown?: string
  symmetry: string
  description: string
  wikipediaUrl: string
}

export const platonicSolids: readonly (SolidDefinition & { id: PlatonicId; dualId: PlatonicId })[] = [
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

export const starSolids: readonly SolidDefinition[] = [
  { id: 'small-stellated-dodecahedron', name: 'Small stellated dodecahedron', symbol: '{5/2,5}', faces: 12, edges: 30, vertices: 12, faceType: 'Pentagram', faceAngle: '36° (tip)', dihedralAngle: '116.57°', dualId: 'great-dodecahedron', vertexConfiguration: '(5/2)⁵' },
  { id: 'great-dodecahedron', name: 'Great dodecahedron', symbol: '{5,5/2}', faces: 12, edges: 30, vertices: 12, faceType: 'Regular pentagon', faceAngle: '108°', dihedralAngle: '63.43°', dualId: 'small-stellated-dodecahedron', vertexConfiguration: '5^(5/2)' },
  { id: 'great-stellated-dodecahedron', name: 'Great stellated dodecahedron', symbol: '{5/2,3}', faces: 12, edges: 30, vertices: 20, faceType: 'Pentagram', faceAngle: '36° (tip)', dihedralAngle: '63.43°', dualId: 'great-icosahedron', vertexConfiguration: '(5/2)³' },
  { id: 'great-icosahedron', name: 'Great icosahedron', symbol: '{3,5/2}', faces: 20, edges: 30, vertices: 12, faceType: 'Equilateral triangle', faceAngle: '60°', dihedralAngle: '41.81°', dualId: 'great-stellated-dodecahedron', vertexConfiguration: '3^(5/2)' },
].map((solid) => ({
  ...solid,
  id: solid.id as SolidId,
  dualId: solid.dualId as SolidId,
  family: 'Kepler–Poinsot polyhedron',
  symmetry: 'Ih',
  description: 'A regular self-intersecting star polyhedron. Face and edge crossings are not counted as extra vertices.',
  wikipediaUrl: `https://en.wikipedia.org/wiki/${solid.name.replaceAll(' ', '_')}`,
}))

export const rectifiedSolids: readonly SolidDefinition[] = [
  {
    id: 'cuboctahedron', name: 'Cuboctahedron', family: 'Archimedean solid', symbol: 'r{4,3}',
    faces: 14, edges: 24, vertices: 12, faceType: 'Triangles / squares', faceBreakdown: '8 triangles · 6 squares',
    faceAngle: 'Triangle 60° · square 90°', dihedralAngle: '125.26°', vertexConfiguration: '3.4.3.4',
    dualName: 'Rhombic dodecahedron', symmetry: 'Oh',
    description: 'The rectification of either a cube or an octahedron. Triangles and squares alternate around each vertex.',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Cuboctahedron',
  },
  {
    id: 'icosidodecahedron', name: 'Icosidodecahedron', family: 'Archimedean solid', symbol: 'r{5,3}',
    faces: 32, edges: 60, vertices: 30, faceType: 'Triangles / pentagons', faceBreakdown: '20 triangles · 12 pentagons',
    faceAngle: 'Triangle 60° · pentagon 108°', dihedralAngle: '142.62°', vertexConfiguration: '3.5.3.5',
    dualName: 'Rhombic triacontahedron', symmetry: 'Ih',
    description: 'The rectification of either a dodecahedron or an icosahedron. Triangles and pentagons alternate around each vertex.',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Icosidodecahedron',
  },
]

export const solids = [...platonicSolids, ...starSolids, ...rectifiedSolids]

export function getSolid(id: string | null): SolidDefinition {
  return solids.find((solid) => solid.id === id) ?? solids[0]
}

import { catalanParents } from './catalanPairs'
import { dualModel, loadPolyhedron } from '../three/transformations'
import { catalogMetrics } from '../three/catalogMetrics'

export type PlatonicId =
  | 'tetrahedron'
  | 'cube'
  | 'octahedron'
  | 'dodecahedron'
  | 'icosahedron'

export type RectifiedId = 'cuboctahedron' | 'icosidodecahedron'
export type TruncatedId = 'truncated-tetrahedron' | 'truncated-cube' | 'truncated-octahedron' | 'truncated-dodecahedron' | 'truncated-icosahedron'
export type SolidId = PlatonicId | RectifiedId | TruncatedId | import('../three/starPolyhedra').StarSolidId | import('./catalanPairs').CatalanId

export type SolidFamily = 'Platonic solid' | 'Kepler–Poinsot polyhedron' | 'Archimedean solid' | 'Catalan solid'

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
  dihedralDetail?: string
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
    id: 'cuboctahedron', dualId: 'rhombic-dodecahedron', name: 'Cuboctahedron', family: 'Archimedean solid', symbol: 'r{4,3}',
    faces: 14, edges: 24, vertices: 12, faceType: 'Triangles / squares', faceBreakdown: '8 triangles · 6 squares',
    faceAngle: 'Triangle 60° · square 90°', dihedralAngle: '125.26°', vertexConfiguration: '3.4.3.4',
    dualName: 'Rhombic dodecahedron', symmetry: 'Oh',
    description: 'The rectification of either a cube or an octahedron. Triangles and squares alternate around each vertex.',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Cuboctahedron',
  },
  {
    id: 'icosidodecahedron', dualId: 'rhombic-triacontahedron', name: 'Icosidodecahedron', family: 'Archimedean solid', symbol: 'r{5,3}',
    faces: 32, edges: 60, vertices: 30, faceType: 'Triangles / pentagons', faceBreakdown: '20 triangles · 12 pentagons',
    faceAngle: 'Triangle 60° · pentagon 108°', dihedralAngle: '142.62°', vertexConfiguration: '3.5.3.5',
    dualName: 'Rhombic triacontahedron', symmetry: 'Ih',
    description: 'The rectification of either a dodecahedron or an icosahedron. Triangles and pentagons alternate around each vertex.',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Icosidodecahedron',
  },
]

export const truncatedSolids: readonly SolidDefinition[] = [
  {
    id: 'truncated-tetrahedron', dualId: 'triakis-tetrahedron', name: 'Truncated tetrahedron', family: 'Archimedean solid', symbol: 't{3,3}',
    faces: 8, edges: 18, vertices: 12, faceType: 'Triangles / hexagons', faceBreakdown: '4 triangles · 4 hexagons',
    faceAngle: 'Triangle 60° · hexagon 120°', dihedralAngle: '70.53° / 109.47°',
    dihedralDetail: 'Hexagon–hexagon: 70.53°; triangle–hexagon: 109.47°', vertexConfiguration: '3.6.6',
    dualName: 'Triakis tetrahedron', symmetry: 'Td',
    description: 'Cutting each tetrahedron corner one third of the way along its edges leaves regular hexagons and opens equilateral triangles.',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Truncated_tetrahedron',
  },
  {
    id: 'truncated-cube', dualId: 'triakis-octahedron', name: 'Truncated cube', family: 'Archimedean solid', symbol: 't{4,3}',
    faces: 14, edges: 36, vertices: 24, faceType: 'Triangles / octagons', faceBreakdown: '8 triangles · 6 octagons',
    faceAngle: 'Triangle 60° · octagon 135°', dihedralAngle: '90° / 125.26°',
    dihedralDetail: 'Octagon–octagon: 90°; triangle–octagon: 125.26°', vertexConfiguration: '3.8.8',
    dualName: 'Triakis octahedron', symmetry: 'Oh',
    description: 'Cutting every cube corner at 1 / (2 + √2) of each edge creates regular octagons and equilateral triangles with the same edge length.',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Truncated_cube',
  },
  {
    id: 'truncated-octahedron', dualId: 'tetrakis-hexahedron', name: 'Truncated octahedron', family: 'Archimedean solid', symbol: 't{3,4}',
    faces: 14, edges: 36, vertices: 24, faceType: 'Squares / hexagons', faceBreakdown: '6 squares · 8 hexagons',
    faceAngle: 'Square 90° · hexagon 120°', dihedralAngle: '109.47° / 125.26°',
    dihedralDetail: 'Hexagon–hexagon: 109.47°; square–hexagon: 125.26°', vertexConfiguration: '4.6.6',
    dualName: 'Tetrakis hexahedron', symmetry: 'Oh',
    description: 'Cutting each octahedron corner one third of the way along its edges creates squares and regular hexagons.',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Truncated_octahedron',
  },
  {
    id: 'truncated-dodecahedron', dualId: 'triakis-icosahedron', name: 'Truncated dodecahedron', family: 'Archimedean solid', symbol: 't{5,3}',
    faces: 32, edges: 90, vertices: 60, faceType: 'Triangles / decagons', faceBreakdown: '20 triangles · 12 decagons',
    faceAngle: 'Triangle 60° · decagon 144°', dihedralAngle: '116.57° / 142.62°',
    dihedralDetail: 'Decagon–decagon: 116.57°; triangle–decagon: 142.62°', vertexConfiguration: '3.10.10',
    dualName: 'Triakis icosahedron', symmetry: 'Ih',
    description: 'Uniform corner cuts turn the original pentagons into regular decagons and open twenty equilateral triangles.',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Truncated_dodecahedron',
  },
  {
    id: 'truncated-icosahedron', dualId: 'pentakis-dodecahedron', name: 'Truncated icosahedron', family: 'Archimedean solid', symbol: 't{3,5}',
    faces: 32, edges: 90, vertices: 60, faceType: 'Pentagons / hexagons', faceBreakdown: '12 pentagons · 20 hexagons',
    faceAngle: 'Pentagon 108° · hexagon 120°', dihedralAngle: '138.19° / 142.62°',
    dihedralDetail: 'Hexagon–hexagon: 138.19°; pentagon–hexagon: 142.62°', vertexConfiguration: '5.6.6',
    dualName: 'Pentakis dodecahedron', symmetry: 'Ih',
    description: 'Cutting the twelve corners of an icosahedron opens pentagons and leaves twenty regular hexagons: the familiar football shape.',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Truncated_icosahedron',
  },
]

export const archimedeanSolids = [...rectifiedSolids, ...truncatedSolids]

export const catalanSolids: readonly SolidDefinition[] = Object.entries(catalanParents).map(([id,parentId]) => {
  const parent=archimedeanSolids.find(solid=>solid.id===parentId)!
  const model=dualModel(loadPolyhedron(parentId))
  const rhombi=parentId==='cuboctahedron' || parentId==='icosidodecahedron'
  return {
    ...catalogMetrics(model), id: id as SolidId, name: parent.dualName!, family: 'Catalan solid',
    symbol: `dual(${parent.symbol})`, faceType: rhombi ? 'Rhombus' : 'Isosceles triangle',
    faceBreakdown: `${model.faces.length} ${rhombi ? 'rhombi' : 'isosceles triangles'}`,
    dualId: parentId, symmetry: parent.symmetry,
    description: `The polar dual of the ${parent.name.toLowerCase()}. Its faces are congruent ${rhombi ? 'rhombi' : 'isosceles triangles'}; its vertices need not share the same distance from the center.`,
    wikipediaUrl: `https://en.wikipedia.org/wiki/${parent.dualName!.replaceAll(' ','_')}`,
  }
})

export const solids = [...platonicSolids, ...starSolids, ...archimedeanSolids, ...catalanSolids]

export function getSolid(id: string | null): SolidDefinition {
  return solids.find((solid) => solid.id === id) ?? solids[0]
}

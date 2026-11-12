/** Polar duals of the seven Archimedean solids currently in the collection. */
export const catalanParents = {
  'rhombic-dodecahedron': 'cuboctahedron',
  'rhombic-triacontahedron': 'icosidodecahedron',
  'triakis-tetrahedron': 'truncated-tetrahedron',
  'triakis-octahedron': 'truncated-cube',
  'tetrakis-hexahedron': 'truncated-octahedron',
  'triakis-icosahedron': 'truncated-dodecahedron',
  'pentakis-dodecahedron': 'truncated-icosahedron',
} as const
export type CatalanId = keyof typeof catalanParents

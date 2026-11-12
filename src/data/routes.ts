import type { SolidId } from './solids'
import type { TransformationKind } from '../three/transformations'

export interface Route { from: SolidId; to: SolidId; kind: TransformationKind; implemented: boolean }
export const routes: Route[] = [
  { from: 'tetrahedron', to: 'truncated-tetrahedron', kind: 'truncate', implemented: true },
  { from: 'cube', to: 'truncated-cube', kind: 'truncate', implemented: true },
  { from: 'octahedron', to: 'truncated-octahedron', kind: 'truncate', implemented: true },
  { from: 'tetrahedron', to: 'tetrahedron', kind: 'dual', implemented: true },
  { from: 'cube', to: 'octahedron', kind: 'dual', implemented: true },
  { from: 'dodecahedron', to: 'icosahedron', kind: 'dual', implemented: true },
  { from: 'small-stellated-dodecahedron', to: 'great-dodecahedron', kind: 'dual', implemented: true },
  { from: 'great-stellated-dodecahedron', to: 'great-icosahedron', kind: 'dual', implemented: true },
  { from: 'dodecahedron', to: 'small-stellated-dodecahedron', kind: 'stellate', implemented: true },
  { from: 'icosahedron', to: 'great-icosahedron', kind: 'stellate', implemented: true },
  { from: 'great-dodecahedron', to: 'great-stellated-dodecahedron', kind: 'stellate', implemented: true },
  { from: 'dodecahedron', to: 'great-dodecahedron', kind: 'stellate', implemented: true },
  { from: 'dodecahedron', to: 'great-stellated-dodecahedron', kind: 'stellate', implemented: true },
  { from: 'tetrahedron', to: 'octahedron', kind: 'rectify', implemented: true },
  { from: 'cube', to: 'cuboctahedron', kind: 'rectify', implemented: true },
  { from: 'octahedron', to: 'cuboctahedron', kind: 'rectify', implemented: true },
  { from: 'dodecahedron', to: 'icosidodecahedron', kind: 'rectify', implemented: true },
  { from: 'icosahedron', to: 'icosidodecahedron', kind: 'rectify', implemented: true },
]

export function routesFrom(id: SolidId) {
  return routes.filter((route) => route.from === id || route.to === id).map((route) => ({
    ...route, destination: route.from === id ? route.to : route.from,
  }))
}

export function defaultRoute(id: SolidId) {
  return routesFrom(id).find((route) => route.kind === 'dual') ?? routesFrom(id)[0]
}

export function routeLabel(kind: TransformationKind, from: SolidId, to: SolidId) {
  if (kind === 'dual') return 'Dual'
  if (kind === 'stellate') return 'Stellation'
  const forward = routes.some((route) => route.kind === kind && route.from === from && route.to === to)
  if (kind === 'truncate') return forward ? 'Truncate' : 'Untruncate'
  return forward ? 'Rectify' : 'Unrectify'
}

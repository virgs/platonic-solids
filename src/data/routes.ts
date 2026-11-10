import type { SolidId } from './solids'
import type { TransformationKind } from '../three/transformations'

export interface Route { from: SolidId; to: SolidId; kind: TransformationKind; implemented: boolean; stages?: number }
export const routes: Route[] = [
  { from: 'tetrahedron', to: 'tetrahedron', kind: 'dual', implemented: true },
  { from: 'cube', to: 'octahedron', kind: 'dual', implemented: true },
  { from: 'dodecahedron', to: 'icosahedron', kind: 'dual', implemented: true },
  { from: 'small-stellated-dodecahedron', to: 'great-dodecahedron', kind: 'dual', implemented: true },
  { from: 'great-stellated-dodecahedron', to: 'great-icosahedron', kind: 'dual', implemented: true },
  { from: 'dodecahedron', to: 'small-stellated-dodecahedron', kind: 'stellate', implemented: true },
  { from: 'icosahedron', to: 'great-icosahedron', kind: 'stellate', implemented: true },
  { from: 'great-dodecahedron', to: 'great-stellated-dodecahedron', kind: 'stellate', implemented: true },
  { from: 'dodecahedron', to: 'great-dodecahedron', kind: 'stellate', implemented: true, stages: 2 },
  { from: 'dodecahedron', to: 'great-stellated-dodecahedron', kind: 'stellate', implemented: true, stages: 3 },
]

export function routesFrom(id: SolidId) {
  return routes.filter((route) => route.from === id || route.to === id).map((route) => ({
    ...route, destination: route.from === id ? route.to : route.from,
  }))
}

import { describe, expect, it } from 'vitest'
import { solids, getSolid } from './solids'
import { routes, routesFrom } from './routes'
import { stellationTargets } from '../three/transformations'
import { routeStops } from '../three/stellationPaths'

describe('relationship map', () => {
  it.each(solids)('exposes the implemented dual for $name', (solid) => {
    expect(routesFrom(solid.id).some((route) => route.kind === 'dual' && route.implemented && route.destination === solid.dualId)).toBe(true)
  })
  it('implements every listed route and exposes the two staged D12 destinations', () => {
    expect(routes.every((route) => route.implemented)).toBe(true)
    expect(routesFrom('dodecahedron').filter((route) => route.stages).map((route) => route.destination)).toEqual(['great-dodecahedron','great-stellated-dodecahedron'])
  })
  it('all enabled map edges agree with the geometry controller', () => {
    for (const route of routes.filter((route) => route.implemented)) {
      if (route.kind === 'dual') expect(getSolid(route.from).dualId).toBe(route.to)
      else if (route.stages) {
        expect(routeStops(route.from,route.to)).toHaveLength(route.stages+1)
      } else {
        expect(stellationTargets[route.from]).toBe(route.to)
        expect(stellationTargets[route.to]).toBe(route.from)
      }
    }
  })
})

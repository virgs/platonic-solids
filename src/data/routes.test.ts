import { describe, expect, it } from 'vitest'
import { solids, getSolid } from './solids'
import { routes, routesFrom } from './routes'
import { loadPolyhedron } from '../three/transformations'
import { createStellationPath } from '../three/stellationPaths'

describe('relationship map', () => {
  it.each(solids)('exposes the implemented dual for $name', (solid) => {
    expect(routesFrom(solid.id).some((route) => route.kind === 'dual' && route.implemented && route.destination === solid.dualId)).toBe(true)
  })
  it('implements every listed route and exposes all three D12 stellations', () => {
    expect(routes.every((route) => route.implemented)).toBe(true)
    expect(routesFrom('dodecahedron').filter((route) => route.kind === 'stellate').map((route) => route.destination)).toEqual(['small-stellated-dodecahedron','great-dodecahedron','great-stellated-dodecahedron'])
  })
  it('all enabled map edges agree with the geometry controller', () => {
    for (const route of routes.filter((route) => route.implemented)) {
      if (route.kind === 'dual') expect(getSolid(route.from).dualId).toBe(route.to)
      else expect(createStellationPath(loadPolyhedron(route.from),route.from,route.to).target.faces).toHaveLength(getSolid(route.to).faces)
    }
  })
})

import { describe, expect, it } from 'vitest'
import { solids, getSolid, rectifiedSolids } from './solids'
import { routes, routesFrom } from './routes'
import { loadPolyhedron } from '../three/transformations'
import { createStellationPath } from '../three/stellationPaths'
import { createTruncationPath } from '../three/truncation'
import { createRectificationPath } from '../three/rectification'

describe('relationship map', () => {
  it.each(solids.filter((solid) => solid.dualId))('exposes the implemented catalog dual for $name', (solid) => {
    expect(routesFrom(solid.id).some((route) => route.kind === 'dual' && route.implemented && route.destination === solid.dualId)).toBe(true)
  })
  it.each(rectifiedSolids)('$name exposes both parent paths and names its external Catalan dual', (solid) => {
    expect(routesFrom(solid.id).filter((route) => route.kind === 'rectify')).toHaveLength(2)
    expect(solid.dualName).toBeTruthy()
    expect(routesFrom(solid.id).some((route) => route.kind === 'dual')).toBe(false)
  })
  it('implements every listed route and exposes all three D12 stellations', () => {
    expect(routes.every((route) => route.implemented)).toBe(true)
    expect(routesFrom('dodecahedron').filter((route) => route.kind === 'stellate').map((route) => route.destination)).toEqual(['small-stellated-dodecahedron','great-dodecahedron','great-stellated-dodecahedron'])
  })
  it('all enabled map edges agree with the geometry controller', () => {
    for (const route of routes.filter((route) => route.implemented)) {
      if (route.kind === 'dual') expect(getSolid(route.from).dualId).toBe(route.to)
      else {
        const source = loadPolyhedron(route.from)
        const path = route.kind === 'truncate' ? createTruncationPath(source,route.from,route.to) : route.kind === 'rectify' ? createRectificationPath(source,route.from,route.to) : createStellationPath(source,route.from,route.to)
        expect(path.target.faces).toHaveLength(getSolid(route.to).faces)
      }
    }
  })
})

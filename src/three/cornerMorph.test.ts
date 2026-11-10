import { describe, expect, it } from 'vitest'
import { EdgesGeometry } from 'three'
import { createCornerMorph } from './cornerMorph'
import { platonicSolids as solids, getSolid } from '../data/solids'

describe('corner-cut dual morph', () => {
  it.each([['cube',0.5],['octahedron',0.75]] as const)('%s reaches the cuboctahedron at its marked player position', (id,progress) => {
    const geometry = createCornerMorph(id)(progress)
    const positions = geometry.getAttribute('position')
    const r = Math.SQRT1_2
    for (let zero = 0; zero < 3; zero++) {
      for (const first of [-r,r]) for (const second of [-r,r]) {
        const expected = [first,second]
        expected.splice(zero,0,0)
        let distance = Infinity
        for (let i = 0; i < positions.count; i++) {
          distance = Math.min(distance,Math.hypot(positions.getX(i)-expected[0],positions.getY(i)-expected[1],positions.getZ(i)-expected[2]))
        }
        expect(distance).toBeLessThan(1e-5)
      }
    }
    geometry.dispose()
  })
  it.each(solids)('$name reaches the expected dual edge count', (solid) => {
    const build = createCornerMorph(solid.id)
    for (const progress of [0, 0.25, 0.5, 0.75, 1]) {
      const geometry = build(progress)
      expect(geometry.getAttribute('position').count).toBeGreaterThan(0)
      expect(geometry.boundingSphere!.radius).toBeCloseTo(1, 5)
      if (progress === 0 || progress === 1) {
        const edges = new EdgesGeometry(geometry, 1)
        expect(edges.getAttribute('position').count / 2).toBe(
          progress === 0 ? solid.edges : getSolid(solid.dualId).edges,
        )
        edges.dispose()
      }
      geometry.dispose()
    }
  })
})

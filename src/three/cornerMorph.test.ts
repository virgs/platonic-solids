import { describe, expect, it } from 'vitest'
import { EdgesGeometry } from 'three'
import { createCornerMorph } from './cornerMorph'
import { platonicSolids as solids, getSolid } from '../data/solids'

describe('corner-cut dual morph', () => {
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

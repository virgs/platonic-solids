import { describe, expect, it } from 'vitest'
import { platonicSolids as solids } from '../data/solids'
import {
  createDualMorphGeometry,
  createSolidGeometry,
  updateDualMorphGeometry,
} from './geometry'

describe('solid geometry normalization', () => {
  it.each(solids)('$name has a unit circumradius', ({ id }) => {
    const geometry = createSolidGeometry(id)
    const positions = geometry.getAttribute('position')
    let maximumRadius = 0

    for (let index = 0; index < positions.count; index += 1) {
      maximumRadius = Math.max(
        maximumRadius,
        Math.hypot(
          positions.getX(index),
          positions.getY(index),
          positions.getZ(index),
        ),
      )
    }

    expect(maximumRadius).toBeCloseTo(1, 6)
    geometry.dispose()
  })
})

describe('dual morph geometry', () => {
  it.each(solids)('$name remains finite and normalized throughout its dual morph', ({ id }) => {
    const morph = createDualMorphGeometry(id)

    for (const progress of [0, 0.25, 0.5, 0.75, 1]) {
      updateDualMorphGeometry(morph, progress)
      const positions = morph.geometry.getAttribute('position')
      let maximumRadius = 0
      for (let index = 0; index < positions.count; index += 1) {
        const radius = Math.hypot(
          positions.getX(index),
          positions.getY(index),
          positions.getZ(index),
        )
        expect(Number.isFinite(radius)).toBe(true)
        maximumRadius = Math.max(maximumRadius, radius)
      }
      expect(maximumRadius).toBeCloseTo(1, 6)
    }

    morph.geometry.dispose()
  })
})

import { describe, expect, it } from 'vitest'
import { solids } from '../data/solids'
import { createSolidGeometry } from './geometry'

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

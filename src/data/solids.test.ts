import { describe, expect, it } from 'vitest'
import { getSolid, platonicSolids as solids } from './solids'

describe('solid catalog', () => {
  it('contains all five Platonic solids', () => {
    expect(solids).toHaveLength(5)
  })

  it.each(solids)('$name has a reciprocal dual relationship', (solid) => {
    expect(getSolid(solid.dualId).dualId).toBe(solid.id)
  })

  it.each(solids)('$name satisfies Euler’s polyhedron formula', (solid) => {
    expect(solid.vertices - solid.edges + solid.faces).toBe(2)
  })
})

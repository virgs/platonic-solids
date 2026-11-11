import { expect, it } from 'vitest'
import { solids } from '../data/solids'
import { loadPolyhedron } from './transformations'
import { highlightGeometry, modelEdges } from './highlights'

it.each(solids)('$name highlights catalog elements without counting crossings or triangulation', solid => {
  const model = loadPolyhedron(solid.id)
  expect(modelEdges(model)).toHaveLength(solid.edges)
  expect(model.vertices).toHaveLength(solid.vertices)
  expect(model.faces).toHaveLength(solid.faces)
  for (const mode of ['faces','edges','vertices'] as const) {
    const rendered = highlightGeometry(model,mode)
    const positions = rendered.geometry.getAttribute('position')
    expect(positions.count).toBeGreaterThan(0)
    expect([...positions.array].every(Number.isFinite)).toBe(true)
    if (mode === 'faces') expect(rendered.geometry.getAttribute('color').count).toBe(positions.count)
    rendered.geometry.dispose()
    if ('edgeGeometry' in rendered) rendered.edgeGeometry?.dispose()
  }
})

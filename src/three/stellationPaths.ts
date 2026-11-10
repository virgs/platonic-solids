import type { SolidId } from '../data/solids'
import { createDestellation, createStarDual, createStellation, type Polyhedron } from './transformations'

export function routeStops(from: SolidId, to: SolidId): SolidId[] {
  const chain: SolidId[] = ['dodecahedron','small-stellated-dodecahedron','great-dodecahedron','great-stellated-dodecahedron']
  const a = chain.indexOf(from), b = chain.indexOf(to)
  if (a < 0 || b < 0) return [from,to]
  return a <= b ? chain.slice(a,b+1) : chain.slice(b,a+1).reverse()
}

/** A single connected surface at each step; adjacent stages share exact endpoints. */
export function createStellationPath(source: Polyhedron, from: SolidId, to: SolidId) {
  const stops = routeStops(from,to)
  const stages: Array<ReturnType<typeof createStellation>> = []
  let model = source
  for (let i=0;i<stops.length-1;i++) {
    const a = stops[i], b = stops[i+1]
    const dual = (a === 'small-stellated-dodecahedron' && b === 'great-dodecahedron') || (b === 'small-stellated-dodecahedron' && a === 'great-dodecahedron')
    const reverse = a === 'small-stellated-dodecahedron' || a === 'great-stellated-dodecahedron' || a === 'great-icosahedron'
    const stage = dual ? createStarDual(model) : reverse ? createDestellation(model) : createStellation(model)
    stages.push(stage)
    model = stage.target
  }
  if (!stages.length) throw new Error('A route needs distinct endpoints')
  return {
    source, target: model, stops,
    at(progress: number): Polyhedron {
      if (progress <= 0) return source
      if (progress >= 1) return model
      const scaled = progress*stages.length
      const index = Math.min(stages.length-1,Math.floor(scaled))
      return stages[index].at(scaled-index)
    },
  }
}

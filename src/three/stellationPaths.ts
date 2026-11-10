import type { SolidId } from '../data/solids'
import { createDestellation, createStarDual, createStellation, type Polyhedron } from './transformations'
import { createFaceExtension } from './faceExtension'

function constructionStops(from: SolidId, to: SolidId): SolidId[] {
  const chain: SolidId[] = ['dodecahedron','small-stellated-dodecahedron','great-dodecahedron','great-stellated-dodecahedron']
  const a = chain.indexOf(from), b = chain.indexOf(to)
  if (a < 0 || b < 0) return [from,to]
  return a <= b ? chain.slice(a,b+1) : chain.slice(b,a+1).reverse()
}

/** Endpoint construction uses existing exact geometry; only planar growth is animated. */
export function createStellationPath(source: Polyhedron, from: SolidId, to: SolidId) {
  const stops = constructionStops(from,to)
  let model = source
  for (let i=0;i<stops.length-1;i++) {
    const a = stops[i], b = stops[i+1]
    const dual = (a === 'small-stellated-dodecahedron' && b === 'great-dodecahedron') || (b === 'small-stellated-dodecahedron' && a === 'great-dodecahedron')
    const reverse = a === 'small-stellated-dodecahedron' || a === 'great-stellated-dodecahedron' || a === 'great-icosahedron'
    const stage = dual ? createStarDual(model) : reverse ? createDestellation(model) : createStellation(model)
    model = stage.target
  }
  if (stops.length < 2) throw new Error('A route needs distinct endpoints')
  const reverse = from === 'small-stellated-dodecahedron' || from === 'great-stellated-dodecahedron' || from === 'great-icosahedron'
    || (from === 'great-dodecahedron' && to === 'dodecahedron')
  const extension = reverse ? createFaceExtension(model,source) : createFaceExtension(source,model)
  return {
    source, target: model,
    at(progress: number): Polyhedron {
      if (progress <= 0) return source
      if (progress >= 1) return model
      return extension.at(reverse ? 1-progress : progress)
    },
  }
}

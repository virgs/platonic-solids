import type { SolidId } from '../data/solids'
import { createDestellation, createStarDual, createStellation, type Polyhedron } from './transformations'
import { createExteriorMorph, createPyramidMorph } from './exterior'

interface StoredPath { origin: SolidId; source: Polyhedron; mode: 'pyramids' | 'surface'; at: (t: number) => Polyhedron }
const reversePaths = new WeakMap<Polyhedron,StoredPath>()

function constructionStops(from: SolidId, to: SolidId): SolidId[] {
  const chain: SolidId[] = ['dodecahedron','small-stellated-dodecahedron','great-dodecahedron','great-stellated-dodecahedron']
  const a = chain.indexOf(from), b = chain.indexOf(to)
  if (a < 0 || b < 0) return [from,to]
  return a <= b ? chain.slice(a,b+1) : chain.slice(b,a+1).reverse()
}

/** Exact mathematical endpoints, with a simple connected exterior between them. */
export function createStellationPath(source: Polyhedron, from: SolidId, to: SolidId) {
  const previous = reversePaths.get(source)
  if (previous?.origin === to) return { source, target: previous.source, mode: previous.mode, at: (t: number) => previous.at(1-Math.max(0,Math.min(1,t))) }
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
  const pyramid = (from === 'dodecahedron' && to === 'small-stellated-dodecahedron') || (to === 'dodecahedron' && from === 'small-stellated-dodecahedron')
  const growPyramids = pyramid ? createPyramidMorph(from === 'dodecahedron' ? source : model,from === 'dodecahedron' ? model : source) : undefined
  const surface = growPyramids ? (t: number) => growPyramids(from === 'dodecahedron' ? t : 1-t) : createExteriorMorph(source,model)
  const path = {
    source, target: model, mode: pyramid ? 'pyramids' as const : 'surface' as const,
    at(progress: number): Polyhedron {
      return surface(Math.max(0,Math.min(1,progress)))
    },
  }
  reversePaths.set(model,{ origin: from, source, mode: path.mode, at: path.at })
  return path
}

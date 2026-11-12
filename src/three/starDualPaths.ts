import { createExteriorMorph } from './exterior'
import { dualModel, type Polyhedron } from './transformations'

interface StoredPath { source: Polyhedron; at: (t: number) => Polyhedron }
const reversePaths = new WeakMap<Polyhedron,StoredPath>()

/** Exact polar endpoints, joined by stable planar exterior regions.
 * Reprojecting moving self-intersecting faces makes the outer surface switch
 * between sheets; keep the surface correspondence fixed for the whole path.
 */
export function createStarDualPath(source: Polyhedron) {
  const previous = reversePaths.get(source)
  if (previous) return { source, target: previous.source, at: (t: number) => previous.at(1-Math.max(0,Math.min(1,t))) }
  const target = dualModel(source)
  const surface = createExteriorMorph(source,target)
  const path = { source, target, at: (t: number) => surface(Math.max(0,Math.min(1,t))) }
  reversePaths.set(target,{ source, at: path.at })
  return path
}

import type { PlatonicId, SolidId } from '../data/solids'
import type { Polyhedron } from './transformations'
import { cutCorners } from './rectification'

export const truncationTargets: Partial<Record<SolidId,SolidId>> = {
  tetrahedron: 'truncated-tetrahedron', cube: 'truncated-cube', octahedron: 'truncated-octahedron',
}
export const truncationParents: Partial<Record<SolidId,PlatonicId>> = {
  'truncated-tetrahedron': 'tetrahedron', 'truncated-cube': 'cube', 'truncated-octahedron': 'octahedron',
}
export function truncationFraction(id: PlatonicId) {
  return id === 'cube' ? 1/(2+Math.SQRT2) : 1/3
}

export function truncateModel(source: Polyhedron, id: PlatonicId): Polyhedron {
  return { ...cutCorners(source,truncationFraction(id)), truncatedFrom: { id, model: source } }
}

/** Preserve the exact parent, including orientation, for seamless reverse playback. */
export function createTruncationPath(source: Polyhedron, from: SolidId, to: SolidId) {
  const forward = truncationTargets[from] === to
  const parent = (forward ? from : truncationParents[from]) as PlatonicId | undefined
  if (!parent || truncationTargets[parent] !== (forward ? to : from) || (!forward && to !== parent)) throw new Error('Unsupported truncation route')
  const original = forward ? source : source.truncatedFrom?.id === parent ? source.truncatedFrom.model : undefined
  if (!original) throw new Error('Truncation parent geometry is missing')
  const target = forward ? truncateModel(original,parent) : original
  return { source, target, at(progress: number) {
    if (progress <= 0) return source
    if (progress >= 1) return target
    return cutCorners(original, truncationFraction(parent)*(forward ? progress : 1-progress))
  } }
}

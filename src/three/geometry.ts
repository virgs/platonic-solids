import {
  BoxGeometry,
  BufferGeometry,
  DodecahedronGeometry,
  IcosahedronGeometry,
  OctahedronGeometry,
  TetrahedronGeometry,
} from 'three'
import type { SolidId } from '../data/solids'

export function normalizeCircumradius(
  source: BufferGeometry,
  radius = 1,
): BufferGeometry {
  const geometry = source.toNonIndexed()
  const positions = geometry.getAttribute('position')
  let maximumRadius = 0

  for (let index = 0; index < positions.count; index += 1) {
    const vertexRadius = Math.hypot(
      positions.getX(index),
      positions.getY(index),
      positions.getZ(index),
    )
    maximumRadius = Math.max(maximumRadius, vertexRadius)
  }

  if (maximumRadius > 0) {
    geometry.scale(radius / maximumRadius, radius / maximumRadius, radius / maximumRadius)
  }

  geometry.computeVertexNormals()
  geometry.computeBoundingSphere()
  source.dispose()
  return geometry
}

export function createSolidGeometry(id: SolidId): BufferGeometry {
  const source = (() => {
    switch (id) {
      case 'tetrahedron':
        return new TetrahedronGeometry(1, 0)
      case 'cube':
        return new BoxGeometry(2, 2, 2)
      case 'octahedron':
        return new OctahedronGeometry(1, 0)
      case 'dodecahedron':
        return new DodecahedronGeometry(1, 0)
      case 'icosahedron':
        return new IcosahedronGeometry(1, 0)
    }
  })()

  return normalizeCircumradius(source)
}

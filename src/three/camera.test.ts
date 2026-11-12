import { expect, it } from 'vitest'
import { PerspectiveCamera, SphereGeometry, Vector3 } from 'three'
import { defaults } from '../settings'
import { viewerFieldOfView } from './camera'

it.each([[280,500],[353,560],[920,380],[400,400]])('the unit circumradius fits the default camera in a %s×%s canvas', (width,height)=>{
  const camera=new PerspectiveCamera(viewerFieldOfView(width,height),width/height,0.1,1000)
  camera.position.set(...defaults.cameraPosition)
  camera.lookAt(0,0,0); camera.updateMatrixWorld()
  const sphere=new SphereGeometry(1,32,24), points=sphere.getAttribute('position')
  let maximum=0
  for (let i=0;i<points.count;i++) {
    const projected=new Vector3().fromBufferAttribute(points,i).project(camera)
    maximum=Math.max(maximum,Math.abs(projected.x),Math.abs(projected.y))
  }
  expect(maximum).toBeLessThan(0.95)
  sphere.dispose()
})

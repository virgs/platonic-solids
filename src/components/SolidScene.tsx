import { highlightGeometry, type Highlight } from '../three/highlights'
import { OrbitControls } from '@react-three/drei'
import { Canvas, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Alert } from 'react-bootstrap'
import { BufferGeometry, DoubleSide, EdgesGeometry, Float32BufferAttribute, GreaterDepth, PerspectiveCamera, type LineSegments, type Mesh } from 'three'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import type { SolidId, PlatonicId } from '../data/solids'
import { getSolid } from '../data/solids'
import { createCornerMorph } from '../three/cornerMorph'
import { createConvexDual, dualModel, loadPolyhedron, renderPolyhedron, type TransformationKind, type Polyhedron } from '../three/transformations'
import { createStellationPath } from '../three/stellationPaths'
import { createTruncationPath } from '../three/truncation'
import { createRectificationPath } from '../three/rectification'
import { createStarDualPath } from '../three/starDualPaths'
import { renderSurface } from '../three/exterior'
import { viewerFieldOfView } from '../three/camera'
import { defaults, type CameraPosition } from '../settings'

interface SolidSceneProps {
  solidId: SolidId
  solidName: string
  highlight: Highlight
  autoRotate: boolean
  resetNonce: number
  zoom: { nonce: number; direction: 'in' | 'out' }
  progress: number
  opacity: number
  originId: SolidId
  kind: TransformationKind
  transitionNonce: number
  color: string
  initialCameraPosition: CameraPosition
  onCameraChange: (position: CameraPosition) => void
  destinationId: SolidId
  restoredModel?: Polyhedron
  onEndpoint: (id: SolidId, model: Polyhedron) => void
}

function TransformationMesh({ highlight, originId, progress, opacity, kind, transitionNonce, color, destinationId, restoredModel, onEndpoint }: Pick<SolidSceneProps, 'highlight' | 'originId' | 'progress' | 'opacity' | 'kind' | 'transitionNonce' | 'color' | 'destinationId' | 'restoredModel' | 'onEndpoint'>) {
  const [initialModel] = useState(() => restoredModel ?? loadPolyhedron(originId))
  const current = useRef(initialModel)
  const [endpointModel, setEndpointModel] = useState(initialModel)
  const pair = useRef<{ source: Polyhedron; target: Polyhedron; render: (t: number) => ReturnType<typeof renderPolyhedron> } | null>(null)
  useEffect(() => {
    const source = current.current
    const makePair = () => {
    if (kind === 'stellate') {
      const model = createStellationPath(source,originId,destinationId)
      return { ...model, render: (t: number) => renderSurface(model.at(t)) }
    }
    if (kind === 'truncate') {
      const model = createTruncationPath(source,originId,destinationId)
      return { ...model, render: (t: number) => renderPolyhedron(model.at(t)) }
    }
    if (kind === 'rectify') {
      const model = createRectificationPath(source,originId,destinationId)
      return { ...model, render: (t: number) => renderPolyhedron(model.at(t)) }
    }
    if (getSolid(originId).family === 'Archimedean solid' || getSolid(originId).family === 'Catalan solid') {
      const model = createConvexDual(source)
      return { ...model, render: (t: number) => renderPolyhedron(model.at(t)) }
    }
    if (getSolid(originId).family === 'Kepler–Poinsot polyhedron') {
      const model = createStarDualPath(source)
      return { ...model, render: (t: number) => renderSurface(model.at(t)) }
    }
    const rendered = renderPolyhedron(source)
    rendered.edgeGeometry.dispose()
    const build = createCornerMorph(originId as PlatonicId, rendered.geometry)
    return { source, target: dualModel(source), render: (t: number) => {
      const geometry = build(t)
      return { geometry, edgeGeometry: new EdgesGeometry(geometry, 1) }
    } }
    }
    pair.current = makePair()
  }, [originId, kind, transitionNonce, destinationId])
  const initialGeometry = useMemo(() => {
    const geometry = new BufferGeometry()
    geometry.setAttribute('position', new Float32BufferAttribute([], 3))
    return geometry
  }, [])
  const mesh = useRef<Mesh>(null)
  const depthMesh = useRef<Mesh>(null)
  const lines = useRef<LineSegments>(null)
  const hiddenLines = useRef<LineSegments>(null)

  useEffect(
    () => () => {
      initialGeometry.dispose()
    },
    [initialGeometry],
  )

  useEffect(() => {
    const path = pair.current
    if (!mesh.current || !path) return
    const { geometry, edgeGeometry } = path.render(progress)
    if (!edgeGeometry.hasAttribute('color')) {
      edgeGeometry.setAttribute('color',new Float32BufferAttribute(new Float32Array(edgeGeometry.getAttribute('position').count*4).fill(1),4))
    }
    mesh.current.geometry.dispose()
    mesh.current.geometry = geometry
    if (depthMesh.current) depthMesh.current.geometry = geometry

    if (lines.current) {
      const previous = lines.current.geometry
      lines.current.geometry = edgeGeometry
      if (hiddenLines.current) hiddenLines.current.geometry = edgeGeometry
      previous.dispose()
    }

    if (progress === 0) { current.current = path.source; setEndpointModel(path.source); onEndpoint(originId,path.source) }
    if (progress === 1) { current.current = path.target; setEndpointModel(path.target); onEndpoint(destinationId,path.target) }
  }, [originId, kind, transitionNonce, progress, destinationId, onEndpoint])

  return (
    <group rotation={[0.35, 0.45, 0]}>
      <mesh ref={mesh} geometry={initialGeometry} renderOrder={0} visible={highlight !== 'faces'}>
        <meshStandardMaterial
          color={color}
          depthWrite={opacity === 1}
          flatShading
          metalness={0.08}
          opacity={highlight === 'edges' || highlight === 'vertices' ? opacity*0.35 : opacity}
          roughness={0.38}
          side={DoubleSide}
          transparent
        />
      </mesh>
      <ElementHighlight model={endpointModel} highlight={highlight} opacity={opacity} />
      {/* Keep edge visibility independent of the faces' transparency mode.
          Clear the faces' depth first so the same offset mask is written at
          100% as at 99%, avoiding flickering on visible edges as well. */}
      <mesh ref={depthMesh} geometry={initialGeometry} renderOrder={1} onBeforeRender={(renderer) => renderer.clearDepth()}>
        <meshBasicMaterial colorWrite={false} depthWrite transparent side={DoubleSide}
          polygonOffset polygonOffsetFactor={1} polygonOffsetUnits={1} />
      </mesh>
      <lineSegments ref={hiddenLines} geometry={initialGeometry} renderOrder={2}>
        <lineBasicMaterial color="#f8f9fa" vertexColors transparent opacity={opacity*(1-opacity)} depthWrite={false} depthFunc={GreaterDepth} />
      </lineSegments>
      <lineSegments ref={lines} geometry={initialGeometry} renderOrder={3}>
        <lineBasicMaterial color="#f8f9fa" vertexColors transparent opacity={opacity} depthWrite={false} />
      </lineSegments>
    </group>
  )
}

function ElementHighlight({ model, highlight, opacity }: { model: Polyhedron; highlight: Highlight; opacity: number }) {
  const rendered = useMemo(() => highlight ? highlightGeometry(model,highlight) : undefined, [model,highlight])
  useEffect(() => () => {
    rendered?.geometry.dispose()
    if (rendered && 'edgeGeometry' in rendered) rendered.edgeGeometry?.dispose()
  }, [rendered])
  if (!rendered) return null
  if (highlight === 'faces') return <mesh geometry={rendered.geometry} renderOrder={0}>
    <meshStandardMaterial color="#ffffff" vertexColors flatShading side={DoubleSide} transparent opacity={opacity} depthWrite={opacity === 1} />
  </mesh>
  return <group>
    <mesh geometry={rendered.geometry} renderOrder={2}><meshBasicMaterial color="#f39c12" transparent opacity={opacity*(1-opacity)} depthWrite={false} depthFunc={GreaterDepth} /></mesh>
    <mesh geometry={rendered.geometry} renderOrder={3}><meshBasicMaterial color="#f39c12" transparent opacity={opacity} depthWrite={false} /></mesh>
  </group>
}

function CameraControls({
  autoRotate,
  resetNonce,
  zoom,
  onCameraChange,
}: Pick<SolidSceneProps, 'autoRotate' | 'resetNonce' | 'zoom' | 'onCameraChange'>) {
  const controls = useRef<OrbitControlsImpl>(null)
  const { camera, size, invalidate } = useThree()
  const lastReset = useRef(resetNonce)
  const lastZoom = useRef(zoom.nonce)

  useEffect(() => {
    if (camera instanceof PerspectiveCamera) {
      // Three owns this mutable camera; update its projection after a resize.
      // eslint-disable-next-line react-hooks/immutability
      camera.fov=viewerFieldOfView(size.width,size.height)
      camera.updateProjectionMatrix()
      invalidate()
    }
  }, [camera,size.width,size.height,invalidate])

  useEffect(() => {
    if (lastReset.current === resetNonce) return
    lastReset.current = resetNonce
    camera.position.set(...defaults.cameraPosition)
    camera.lookAt(0, 0, 0)
    controls.current?.target.set(0, 0, 0)
    controls.current?.update()
    onCameraChange(camera.position.toArray() as CameraPosition)
  }, [camera, resetNonce, onCameraChange])

  useEffect(() => {
    const orbit = controls.current
    let timer: ReturnType<typeof setTimeout> | undefined
    const save = () => onCameraChange(camera.position.toArray() as CameraPosition)
    const changed = () => {
      if (timer !== undefined) return
      timer = setTimeout(() => { timer = undefined; save() }, 200)
    }
    orbit?.addEventListener('change', changed)
    orbit?.addEventListener('end', save)
    window.addEventListener('pagehide', save)
    return () => {
      orbit?.removeEventListener('change', changed)
      orbit?.removeEventListener('end', save)
      window.removeEventListener('pagehide', save)
      if (timer !== undefined) clearTimeout(timer)
    }
  }, [camera, onCameraChange])

  useEffect(() => {
    if (zoom.nonce === lastZoom.current) return
    lastZoom.current = zoom.nonce
    const distance = camera.position.length()
    const multiplier = zoom.direction === 'in' ? 0.82 : 1.22
    camera.position.setLength(Math.min(6, Math.max(1.8, distance * multiplier)))
    controls.current?.update()
    onCameraChange(camera.position.toArray() as CameraPosition)
  }, [camera, zoom, onCameraChange])

  return (
    <OrbitControls
      ref={controls}
      autoRotate={autoRotate}
      autoRotateSpeed={0.8}
      enableDamping
      enablePan={false}
      minDistance={1.8}
      maxDistance={6}
      target={[0, 0, 0]}
    />
  )
}

export function SolidScene(props: SolidSceneProps) {
  return (
    <Canvas
      data-highlight={props.highlight ?? 'none'}
      aria-label={`Interactive 3D model of a ${props.solidName}`}
      camera={{ position: props.initialCameraPosition, fov: 42 }}
      className="position-absolute top-0 start-0 w-100 h-100"
      dpr={[1, 2]}
      fallback={
        <Alert variant="warning" className="m-3">
          This browser cannot display the WebGL model. The solid's properties
          remain available below.
        </Alert>
      }
    >
      <color attach="background" args={['#222222']} />
      <ambientLight intensity={1.2} />
      <directionalLight position={[3, 4, 5]} intensity={2.4} />
      <directionalLight position={[-4, -2, -3]} intensity={0.8} />
      <TransformationMesh highlight={props.highlight} originId={props.originId} progress={props.progress} opacity={props.opacity} kind={props.kind} transitionNonce={props.transitionNonce} color={props.color}
        destinationId={props.destinationId} restoredModel={props.restoredModel} onEndpoint={props.onEndpoint} />
      <CameraControls
        autoRotate={props.autoRotate}
        resetNonce={props.resetNonce}
        zoom={props.zoom}
        onCameraChange={props.onCameraChange}
      />
    </Canvas>
  )
}

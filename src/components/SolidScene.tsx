import { OrbitControls } from '@react-three/drei'
import { Canvas, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Alert } from 'react-bootstrap'
import { BufferGeometry, DoubleSide, EdgesGeometry, Float32BufferAttribute, type LineSegments, type Mesh } from 'three'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import type { SolidId, PlatonicId } from '../data/solids'
import { getSolid } from '../data/solids'
import { createCornerMorph } from '../three/cornerMorph'
import { createStarDual, createStellation, createDestellation, dualModel, loadPolyhedron, renderPolyhedron, type TransformationKind, type Polyhedron } from '../three/transformations'

interface SolidSceneProps {
  solidId: SolidId
  solidName: string
  autoRotate: boolean
  resetNonce: number
  zoom: { nonce: number; direction: 'in' | 'out' }
  progress: number
  opacity: number
  originId: SolidId
  kind: TransformationKind
  transitionNonce: number
}

function TransformationMesh({ originId, progress, opacity, kind, transitionNonce }: Pick<SolidSceneProps, 'originId' | 'progress' | 'opacity' | 'kind' | 'transitionNonce'>) {
  const [initialModel] = useState(() => loadPolyhedron(originId))
  const current = useRef(initialModel)
  const pair = useRef<{ source: Polyhedron; target: Polyhedron; render: (t: number) => ReturnType<typeof renderPolyhedron> } | null>(null)
  useEffect(() => {
    const source = current.current
    const makePair = () => {
    if (kind === 'stellate') {
      const reverse = originId === 'small-stellated-dodecahedron' || originId === 'great-stellated-dodecahedron'
      const model = reverse ? createDestellation(source) : createStellation(source)
      return { ...model, render: (t: number) => renderPolyhedron(model.at(t)) }
    }
    if (getSolid(originId).family !== 'Platonic solid') {
      const model = createStarDual(source)
      return { ...model, render: (t: number) => renderPolyhedron(model.at(t)) }
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
  }, [originId, kind, transitionNonce])
  const initialGeometry = useMemo(() => {
    const geometry = new BufferGeometry()
    geometry.setAttribute('position', new Float32BufferAttribute([], 3))
    return geometry
  }, [])
  const mesh = useRef<Mesh>(null)
  const lines = useRef<LineSegments>(null)

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
    mesh.current.geometry.dispose()
    mesh.current.geometry = geometry

    if (lines.current) {
      const previous = lines.current.geometry
      lines.current.geometry = edgeGeometry
      previous.dispose()
    }

    if (progress === 0) current.current = path.source
    if (progress === 1) current.current = path.target
  }, [originId, kind, transitionNonce, progress])

  return (
    <group rotation={[0.35, 0.45, 0]}>
      <mesh ref={mesh} geometry={initialGeometry}>
        <meshStandardMaterial
          color="#4cc9f0"
          depthWrite={opacity === 1}
          flatShading
          metalness={0.08}
          opacity={opacity}
          roughness={0.38}
          side={DoubleSide}
          transparent
        />
      </mesh>
      <lineSegments ref={lines}>
        <bufferGeometry />
        <lineBasicMaterial color="#f8f9fa" transparent opacity={0.88} />
      </lineSegments>
    </group>
  )
}

function CameraControls({
  autoRotate,
  resetNonce,
  zoom,
}: Pick<SolidSceneProps, 'autoRotate' | 'resetNonce' | 'zoom'>) {
  const controls = useRef<OrbitControlsImpl>(null)
  const { camera } = useThree()

  useEffect(() => {
    camera.position.set(2.4, 1.7, 2.4)
    camera.lookAt(0, 0, 0)
    controls.current?.target.set(0, 0, 0)
    controls.current?.update()
  }, [camera, resetNonce])

  useEffect(() => {
    if (zoom.nonce === 0) return
    const distance = camera.position.length()
    const multiplier = zoom.direction === 'in' ? 0.82 : 1.22
    camera.position.setLength(Math.min(6, Math.max(1.8, distance * multiplier)))
    controls.current?.update()
  }, [camera, zoom])

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
      aria-label={`Interactive 3D model of a ${props.solidName}`}
      camera={{ position: [2.4, 1.7, 2.4], fov: 42 }}
      className="ratio ratio-21x9"
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
      <TransformationMesh originId={props.originId} progress={props.progress} opacity={props.opacity} kind={props.kind} transitionNonce={props.transitionNonce} />
      <CameraControls
        autoRotate={props.autoRotate}
        resetNonce={props.resetNonce}
        zoom={props.zoom}
      />
    </Canvas>
  )
}

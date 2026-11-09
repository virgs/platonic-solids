import { OrbitControls } from '@react-three/drei'
import { Canvas, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Alert } from 'react-bootstrap'
import { DoubleSide, EdgesGeometry, type LineSegments, type Mesh } from 'three'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import type { SolidId, PlatonicId } from '../data/solids'
import { createCornerMorph } from '../three/cornerMorph'
import { createStarGeometry, starModels, type StarSolidId } from '../three/starPolyhedra'

interface SolidSceneProps {
  solidId: SolidId
  solidName: string
  autoRotate: boolean
  resetNonce: number
  zoom: { nonce: number; direction: 'in' | 'out' }
  progress: number
  opacity: number
}

function DualMorphMesh({
  solidId,
  progress,
  opacity,
}: {
  solidId: PlatonicId
  progress: number
  opacity: number
}) {
  const [origin] = useState(solidId)
  const build = useMemo(() => createCornerMorph(origin), [origin])
  const initialGeometry = useMemo(() => build(0), [build])
  const mesh = useRef<Mesh>(null)
  const lines = useRef<LineSegments>(null)

  useEffect(
    () => () => {
      initialGeometry.dispose()
    },
    [initialGeometry],
  )

  useEffect(() => {
    if (!mesh.current) return
    const geometry = build(progress)
    mesh.current.geometry.dispose()
    mesh.current.geometry = geometry

    if (lines.current) {
      const previous = lines.current.geometry
      lines.current.geometry = new EdgesGeometry(geometry, 1)
      previous.dispose()
    }

  }, [build, progress])

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
        <edgesGeometry args={[initialGeometry, 1]} />
        <lineBasicMaterial color="#f8f9fa" transparent opacity={0.88} />
      </lineSegments>
    </group>
  )
}

function StarMesh({ id, opacity }: { id: StarSolidId; opacity: number }) {
  const model = useMemo(() => createStarGeometry(id), [id])
  useEffect(() => () => {
    model.geometry.dispose()
    model.edgeGeometry.dispose()
  }, [model])
  return (
    <group rotation={[0.35, 0.45, 0]}>
      <mesh geometry={model.geometry}>
        <meshStandardMaterial color="#4cc9f0" side={DoubleSide} transparent opacity={opacity} depthWrite={opacity === 1} roughness={0.38} flatShading />
      </mesh>
      <lineSegments geometry={model.edgeGeometry}>
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
      {props.solidId in starModels ? (
        <StarMesh id={props.solidId as StarSolidId} opacity={props.opacity} />
      ) : (
        <DualMorphMesh solidId={props.solidId as PlatonicId} progress={props.progress} opacity={props.opacity} />
      )}
      <CameraControls
        autoRotate={props.autoRotate}
        resetNonce={props.resetNonce}
        zoom={props.zoom}
      />
    </Canvas>
  )
}

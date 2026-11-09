import { Edges, OrbitControls } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import { Alert } from 'react-bootstrap'
import { DoubleSide, EdgesGeometry, type LineSegments } from 'three'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import type { SolidId } from '../data/solids'
import {
  createDualMorphGeometry,
  createSolidGeometry,
  updateDualMorphGeometry,
} from '../three/geometry'

interface SolidSceneProps {
  solidId: SolidId
  solidName: string
  autoRotate: boolean
  resetNonce: number
  zoom: { nonce: number; direction: 'in' | 'out' }
  dualTransition: boolean
  onDualComplete: () => void
}

function SolidMesh({ solidId }: { solidId: SolidId }) {
  const geometry = useMemo(() => createSolidGeometry(solidId), [solidId])

  useEffect(() => () => geometry.dispose(), [geometry])

  return (
    <mesh geometry={geometry} rotation={[0.35, 0.45, 0]}>
      <meshStandardMaterial
        color="#4cc9f0"
        depthWrite={false}
        metalness={0.08}
        opacity={0.58}
        roughness={0.38}
        side={DoubleSide}
        transparent
      />
      <Edges color="#f8f9fa" threshold={15} />
    </mesh>
  )
}

function DualMorphMesh({
  solidId,
  onComplete,
}: {
  solidId: SolidId
  onComplete: () => void
}) {
  const morph = useMemo(() => createDualMorphGeometry(solidId), [solidId])
  const lines = useRef<LineSegments>(null)
  const startedAt = useRef<number | null>(null)
  const completed = useRef(false)

  useEffect(
    () => () => {
      morph.geometry.dispose()
      lines.current?.geometry.dispose()
    },
    [morph],
  )

  useFrame(({ clock }) => {
    startedAt.current ??= clock.elapsedTime
    const elapsed = clock.elapsedTime - startedAt.current
    const rawProgress = Math.min(1, elapsed / 1.8)
    const progress = rawProgress * rawProgress * (3 - 2 * rawProgress)
    updateDualMorphGeometry(morph, progress)

    if (lines.current) {
      const previous = lines.current.geometry
      lines.current.geometry = new EdgesGeometry(morph.geometry, 12)
      previous.dispose()
    }

    if (rawProgress === 1 && !completed.current) {
      completed.current = true
      onComplete()
    }
  })

  return (
    <group rotation={[0.35, 0.45, 0]}>
      <mesh geometry={morph.geometry}>
        <meshStandardMaterial
          color="#4cc9f0"
          depthWrite={false}
          flatShading
          metalness={0.08}
          opacity={0.58}
          roughness={0.38}
          side={DoubleSide}
          transparent
        />
      </mesh>
      <lineSegments ref={lines}>
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
      {props.dualTransition ? (
        <DualMorphMesh solidId={props.solidId} onComplete={props.onDualComplete} />
      ) : (
        <SolidMesh solidId={props.solidId} />
      )}
      <CameraControls
        autoRotate={props.autoRotate}
        resetNonce={props.resetNonce}
        zoom={props.zoom}
      />
    </Canvas>
  )
}

import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Card,
  Container,
  Navbar,
  Modal,
  ListGroup,
} from 'react-bootstrap'
import type { Highlight } from './three/highlights'
import { SolidScene } from './components/SolidScene'
import { RelationshipMap } from './components/RelationshipMap'
import { ViewerToolbar } from './components/ViewerToolbar'
import { NavigationMenu } from './components/NavigationMenu'
import { SolidSummary } from './components/SolidSummary'
import { DialogCloseButton } from './components/DialogCloseButton'
import { TransformationPlayer, TransformationExplanation } from './components/TransformationPlayer'
import { defaultRoute, routesFrom } from './data/routes'
import { rectificationTargets } from './three/rectification'
import { stellationTargets, type TransformationKind, type Polyhedron } from './three/transformations'
import { readSettings, writeSettings, type CameraPosition, type Settings } from './settings'
import {
  getSolid,
  type SolidDefinition,
  type SolidId,
} from './data/solids'

function initialSolid(settings: Settings): SolidDefinition {
  const query = new URLSearchParams(window.location.search).get('solid')
  return getSolid(query ?? settings.solidId)
}

interface HistoryStop { solidId: SolidId; model: Polyhedron; camera: CameraPosition; signature: string }

export function App() {
  const [saved] = useState(readSettings)
  const [solidId, setSolidId] = useState<SolidId>(() => initialSolid(saved).id)
  const [highlight, setHighlight] = useState<Highlight>(saved.highlight)
  const [autoRotate, setAutoRotate] = useState(saved.autoRotate)
  const [originId, setOriginId] = useState<SolidId>(() => initialSolid(saved).id)
  const [progress, setProgress] = useState(0)
  const progressRef = useRef(0)
  const [playing, setPlaying] = useState(false)
  const [showMap, setShowMap] = useState(false)
  const [showExplanation, setShowExplanation] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [showDisplay, setShowDisplay] = useState(saved.displayOpen)
  const [restoredModel, setRestoredModel] = useState<Polyhedron>()
  const [history, setHistory] = useState<{ entries: HistoryStop[]; index: number }>({ entries: [], index: -1 })
  const [target, setTarget] = useState(1)
  const [kind, setKind] = useState<TransformationKind>(() => defaultRoute(initialSolid(saved).id).kind)
  const [routeDestination, setRouteDestination] = useState<SolidId>(() => defaultRoute(initialSolid(saved).id).destination)
  const [transitionNonce, setTransitionNonce] = useState(0)
  const [opacity, setOpacity] = useState(saved.opacity)
  const [color, setColor] = useState(saved.color)
  const cameraPosition = useRef<CameraPosition>(saved.cameraPosition)
  const [initialCameraPosition, setInitialCameraPosition] = useState(saved.cameraPosition)
  const dualTransition = playing || (progress > 0 && progress < 1)
  const [selectionKey, setSelectionKey] = useState(0)
  const [duration, setDuration] = useState(saved.duration)
  const [resetNonce, setResetNonce] = useState(0)
  const [zoom, setZoom] = useState<{
    nonce: number
    direction: 'in' | 'out'
  }>({ nonce: 0, direction: 'in' })
  const solid = getSolid(solidId)
  const destinationId = routeDestination
  const rectificationRoutes = routesFrom(solidId).filter((route) => route.kind === 'rectify')
  const rectificationRoute = rectificationRoutes.find((route) => route.destination === rectificationTargets[solidId]) ?? rectificationRoutes[0]
  const truncationRoute = routesFrom(solidId).find(route => route.kind === 'truncate')
  const latestSettings = useRef<Settings>(saved)

  const recordEndpoint = useCallback((id: SolidId, model: Polyhedron) => {
    const signature = JSON.stringify([id,model.vertices.map((v) => v.toArray()),model.faces])
    const camera: CameraPosition = [...cameraPosition.current]
    setHistory((previous) => {
      const index = previous.entries.findIndex((entry) => entry.signature === signature)
      if (index >= 0) return index === previous.index ? previous : { ...previous, index }
      const entries = [...previous.entries.slice(0,previous.index+1), { solidId: id, model, camera, signature }].slice(-30)
      return { entries, index: entries.length-1 }
    })
  }, [])

  useEffect(() => {
    latestSettings.current = { solidId, autoRotate, duration, opacity, color, cameraPosition: cameraPosition.current, displayOpen: showDisplay, highlight }
    writeSettings(latestSettings.current)
  }, [solidId, autoRotate, duration, opacity, color, showDisplay, highlight])

  const saveCamera = useCallback((position: CameraPosition) => {
    cameraPosition.current = position
    latestSettings.current = { ...latestSettings.current, cameraPosition: position }
    writeSettings(latestSettings.current)
    setHistory((previous) => {
      const entry = previous.entries[previous.index]
      if (!entry || entry.camera.every((value,i) => Math.abs(value-position[i]) < 1e-6)) return previous
      const entries = [...previous.entries]
      entries[previous.index] = { ...entry, camera: [...position] }
      return { ...previous, entries }
    })
  }, [])

  useEffect(() => {
    if (!playing) return
    let frame = 0
    let previous: number | null = null
    const tick = (now: number) => {
      const delta = previous === null ? 0 : (now - previous) / 1000
      previous = now
      const direction = target === 1 ? 1 : -1
      const next = Math.max(0, Math.min(1, progressRef.current + direction * delta / duration))
      progressRef.current = next
      setProgress(next)
      if (next === target) {
        setPlaying(false)
        setSolidId(target === 0 ? originId : destinationId)
      } else {
        frame = requestAnimationFrame(tick)
      }
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [playing, target, duration, originId, destinationId])

  useEffect(() => {
    const url = new URL(window.location.href)
    url.searchParams.set('solid', solidId)
    window.history.replaceState({}, '', url)
  }, [solidId])

  function changeSolid(nextId: SolidId) {
    if (dualTransition) return
    setSolidId(nextId)
    setOriginId(nextId)
    setKind(defaultRoute(nextId).kind)
    setRouteDestination(defaultRoute(nextId).destination)
    setRestoredModel(undefined)
    setProgress(0)
    progressRef.current = 0
    setSelectionKey((value) => value + 1)
    setInitialCameraPosition(cameraPosition.current)
  }

  function startTransition(nextKind: TransformationKind = 'dual', requestedDestination?: SolidId) {
    const requested = requestedDestination ?? (nextKind === 'dual' ? solid.dualId : nextKind === 'stellate' ? stellationTargets[solidId] : nextKind === 'truncate' ? truncationRoute?.destination : rectificationRoute?.destination)
    if (!requested || !routesFrom(solidId).some((route) => route.kind === nextKind && route.destination === requested)) return
    setAutoRotate(false)
    const existingOtherEnd = progress === 1 ? originId : destinationId
    if (nextKind !== kind || requested !== existingOtherEnd) {
      setOriginId(solidId)
      setKind(nextKind)
      setRouteDestination(requested)
      setTransitionNonce((n) => n+1)
      progressRef.current = 0
      setProgress(0)
      setTarget(1)
    } else {
      setTarget(progress === 1 ? 0 : 1)
    }
    setHighlight(null)
    setPlaying(true)
  }

  function seek(value: number) {
    setHighlight(null)
    value = Math.max(0,Math.min(1,value))
    setPlaying(false)
    setAutoRotate(false)
    progressRef.current = value
    setProgress(value)
    if (value === 0) setSolidId(originId)
    if (value === 1) setSolidId(destinationId)
  }

  function changeZoom(direction: 'in' | 'out') {
    setZoom((current) => ({ nonce: current.nonce + 1, direction }))
  }

  function restoreStop(index: number) {
    const entry = history.entries[index]
    if (!entry || dualTransition) return
    setPlaying(false)
    setAutoRotate(false)
    setSolidId(entry.solidId)
    setOriginId(entry.solidId)
    setKind(defaultRoute(entry.solidId).kind)
    setRouteDestination(defaultRoute(entry.solidId).destination)
    setProgress(0)
    progressRef.current = 0
    cameraPosition.current = [...entry.camera]
    setInitialCameraPosition([...entry.camera])
    setRestoredModel(entry.model)
    setSelectionKey((value) => value+1)
    setHistory((previous) => ({ ...previous,index }))
    setShowHistory(false)
  }

  return (
    <div className="vh-100 d-flex flex-column">
      <Navbar bg="primary" data-bs-theme="dark" className="py-1 flex-shrink-0">
        <Container>
          <Navbar.Brand href="./" className="fw-semibold py-1 me-0">
            <img
              src={`${import.meta.env.BASE_URL}favicon.svg`}
              width="28"
              height="28"
              className="d-inline-block align-top me-2"
              alt=""
              aria-hidden="true"
            />
            Polyhedra Explorer
          </Navbar.Brand>
          <NavigationMenu disabled={dualTransition} autoRotate={autoRotate} onRotate={()=>setAutoRotate(value=>!value)} onReset={()=>setResetNonce(value=>value+1)} onMap={()=>setShowMap(true)} onHistory={()=>setShowHistory(true)} />
        </Container>
      </Navbar>

      <Container as="main" className="py-2 d-flex flex-column flex-grow-1 overflow-hidden">
        <Card className="border-0 bg-body mb-2 flex-shrink-0">
          <Card.Body className="px-2 py-1">
            <SolidSummary solid={solid} highlight={highlight} onHighlight={setHighlight} disabled={dualTransition} onSelect={changeSolid} />
          </Card.Body>
        </Card>

        <Card className="border-0 bg-body flex-grow-1 overflow-hidden">
          <Card.Header className="border-0 bg-body px-2 py-1 flex-shrink-0">
            <ViewerToolbar solid={solid} disabled={dualTransition} autoRotate={autoRotate} onRotate={()=>setAutoRotate(value=>!value)} onReset={()=>setResetNonce(value=>value+1)} onZoom={changeZoom}
              color={color} onColor={setColor} opacity={opacity} onOpacity={setOpacity} showOpacity={showDisplay} onToggleOpacity={setShowDisplay} onTransform={startTransition} />
            <div className="mt-1">
                <TransformationPlayer originId={originId} destinationId={destinationId} progress={progress} playing={playing} kind={kind} onSeek={seek}
                  duration={duration} onDurationChange={setDuration}
                  onExplain={() => { setPlaying(false); setShowExplanation(true) }}
                  onPlay={() => {
                      if (playing) setPlaying(false)
                      else if (progress > 0 && progress < 1) setPlaying(true)
                      else startTransition(kind,progress === 1 ? originId : destinationId)
                    }} />
            </div>
          </Card.Header>

          <Card.Body className="p-0 bg-body position-relative flex-grow-1 overflow-hidden">
            <SolidScene
              key={selectionKey}
              solidId={solid.id}
              solidName={solid.name}
              highlight={dualTransition ? null : highlight}
              autoRotate={autoRotate}
              resetNonce={resetNonce}
              zoom={zoom}
              progress={progress}
              opacity={opacity}
              originId={originId}
              kind={kind}
              transitionNonce={transitionNonce}
              color={color}
              initialCameraPosition={initialCameraPosition}
              onCameraChange={saveCamera}
              destinationId={destinationId}
              restoredModel={restoredModel}
              onEndpoint={recordEndpoint}
            />
          </Card.Body>
        </Card>
      </Container>
      <RelationshipMap show={showMap} onHide={() => setShowMap(false)} current={solidId}
        activeRoute={[originId,destinationId]} onInspect={changeSolid} onTransform={startTransition} />
      <TransformationExplanation show={showExplanation} onHide={() => setShowExplanation(false)} originId={originId} destinationId={destinationId} progress={progress} kind={kind} />
      <Modal show={showHistory} onHide={() => setShowHistory(false)} centered scrollable aria-labelledby="history-title">
        <Modal.Header><Modal.Title id="history-title">Route history</Modal.Title><DialogCloseButton title="Close history" onClick={() => setShowHistory(false)} /></Modal.Header>
        <Modal.Body>
          <div className="d-flex gap-2 mb-3">
            <button className="btn btn-primary btn-sm" aria-label="Back" title="Previous history entry" disabled={history.index <= 0} onClick={() => restoreStop(history.index-1)}><ArrowLeft size={16} aria-hidden="true" /><span className="d-none d-lg-inline"> Back</span></button>
            <button className="btn btn-primary btn-sm" aria-label="Forward" title="Next history entry" disabled={history.index >= history.entries.length-1} onClick={() => restoreStop(history.index+1)}><span className="d-none d-lg-inline">Forward </span><ArrowRight size={16} aria-hidden="true" /></button>
          </div>
          <ListGroup>{history.entries.map((entry,index) => (
            <ListGroup.Item key={`${entry.signature}:${index}`} title={`Restore ${getSolid(entry.solidId).name} view`} action active={index === history.index}
              onClick={() => restoreStop(index)}>{index+1}. {getSolid(entry.solidId).name}</ListGroup.Item>
          ))}</ListGroup>
        </Modal.Body>
      </Modal>
    </div>
  )
}

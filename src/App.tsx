import {
  Github,
  Network,
  History,
  Blend,
  ArrowLeft,
  ArrowRight,
  RefreshCw,
  RotateCcw,
  Rotate3D,
  Sparkles,
  ZoomIn,
  ZoomOut,
} from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { version } from '../package.json'
import {
  Badge,
  ButtonGroup,
  Card,
  Collapse,
  Col,
  Container,
  Dropdown,
  Form,
  Navbar,
  Modal,
  ListGroup,
  Row,
  Stack,
} from 'react-bootstrap'
import { SolidScene } from './components/SolidScene'
import { RelationshipMap } from './components/RelationshipMap'
import { TransformationPlayer, TransformationExplanation } from './components/TransformationPlayer'
import { routesFrom } from './data/routes'
import { stellationTargets, type TransformationKind, type Polyhedron } from './three/transformations'
import { readSettings, writeSettings, type CameraPosition, type Settings } from './settings'
import {
  getSolid,
  platonicSolids,
  starSolids,
  type SolidDefinition,
  type SolidId,
} from './data/solids'

function initialSolid(settings: Settings): SolidDefinition {
  const query = new URLSearchParams(window.location.search).get('solid')
  return getSolid(query ?? settings.solidId)
}

function Property({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <span className="text-body-secondary small me-1">{label}</span>
      <span className="fw-semibold small">{value}</span>
    </div>
  )
}

interface HistoryStop { solidId: SolidId; model: Polyhedron; camera: CameraPosition; signature: string }

export function App() {
  const [saved] = useState(readSettings)
  const [solidId, setSolidId] = useState<SolidId>(() => initialSolid(saved).id)
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
  const [kind, setKind] = useState<TransformationKind>('dual')
  const [routeDestination, setRouteDestination] = useState<SolidId>()
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
  const origin = getSolid(originId)
  const destinationId = kind === 'dual' ? origin.dualId : routeDestination ?? stellationTargets[originId] ?? originId
  const stellationDestination = stellationTargets[solidId]
  const unstellate = solid.faceType === 'Pentagram' || solidId === 'great-icosahedron'
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
    latestSettings.current = { solidId, autoRotate, duration, opacity, color, cameraPosition: cameraPosition.current, displayOpen: showDisplay }
    writeSettings(latestSettings.current)
  }, [solidId, autoRotate, duration, opacity, color, showDisplay])

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
    setKind('dual')
    setRouteDestination(undefined)
    setRestoredModel(undefined)
    setProgress(0)
    progressRef.current = 0
    setSelectionKey((value) => value + 1)
    setInitialCameraPosition(cameraPosition.current)
  }

  function startDualTransition(nextKind: TransformationKind = 'dual', requestedDestination?: SolidId) {
    setAutoRotate(false)
    const requested = requestedDestination ?? (nextKind === 'dual' ? solid.dualId : stellationTargets[solidId])
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
    setPlaying(true)
  }

  function seek(value: number) {
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
    setKind('dual')
    setRouteDestination(undefined)
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
          <Navbar.Brand href="./" className="fw-semibold py-1">
            <img
              src={`${import.meta.env.BASE_URL}favicon.svg`}
              width="28"
              height="28"
              className="d-inline-block align-top me-2"
              alt=""
              aria-hidden="true"
            />
            Platonic Solids Explorer
          </Navbar.Brand>
          <Stack direction="horizontal" gap={2}>
            <Badge bg="dark">v{version}</Badge>
            <a
              className="btn btn-outline-light btn-sm"
              href="https://github.com/virgs/platonic-solids"
              target="_blank"
              rel="noreferrer"
            >
              <Github size={16} aria-hidden="true" /> GitHub
            </a>
          </Stack>
        </Container>
      </Navbar>

      <Container as="main" className="py-2 d-flex flex-column flex-grow-1 overflow-hidden">
        <Card className="border-0 bg-body mb-2 flex-shrink-0">
          <Card.Body className="px-2 py-1">
            <Stack
              direction="horizontal"
              gap={3}
              className="justify-content-between align-items-center flex-wrap"
            >
              <Stack direction="horizontal" gap={2}>
                <div>
                  <div className="text-info small fw-semibold text-uppercase">
                    {solid.family}
                  </div>
                  <h1 className="h4 mb-0">{solid.name}</h1>
                </div>
                <Badge bg="secondary">{solid.symbol}</Badge>
              </Stack>

              <Stack
                direction="horizontal"
                gap={3}
                className="flex-wrap justify-content-end"
              >
                <Property label="Faces" value={solid.faces} />
                <Property label="Edges" value={solid.edges} />
                <Property label="Vertices" value={solid.vertices} />
                <Property label="Face" value={solid.faceType} />
                <Property label="Face angle" value={solid.faceAngle} />
                <Property label="Dihedral" value={solid.dihedralAngle} />
                <a
                  className="link-info small"
                  href={solid.wikipediaUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Wikipedia
                </a>
              </Stack>
            </Stack>
          </Card.Body>
        </Card>

        <Card className="border-0 bg-body flex-grow-1 overflow-hidden">
          <Card.Header className="border-0 bg-body px-2 py-1 flex-shrink-0">
            <Row className="align-items-center g-2">
              <Col xs={12} md={3}>
                <Dropdown>
                  <Dropdown.Toggle
                    variant="primary"
                    size="sm"
                    id="solid-selector"
                    disabled={dualTransition}
                  >
                    {solid.name}
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Header>Platonic solids</Dropdown.Header>
                    {platonicSolids.map((option) => (
                      <Dropdown.Item
                        key={option.id}
                        active={option.id === solidId}
                        onClick={() => changeSolid(option.id)}
                      >
                        {option.name}
                      </Dropdown.Item>
                    ))}
                    <Dropdown.Divider />
                    <Dropdown.Header>Kepler–Poinsot</Dropdown.Header>
                    {starSolids.map((option) => (
                      <Dropdown.Item key={option.id} active={option.id === solidId} onClick={() => changeSolid(option.id)}>
                        {option.name}
                      </Dropdown.Item>
                    ))}
                  </Dropdown.Menu>
                </Dropdown>
              </Col>

              <Col xs={12} md={6} className="text-center">
                <ButtonGroup size="sm" aria-label="Camera controls">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => changeZoom('out')}
                    aria-label="Zoom out"
                    title="Zoom out"
                  >
                    <ZoomOut size={16} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => changeZoom('in')}
                    aria-label="Zoom in"
                    title="Zoom in"
                  >
                    <ZoomIn size={16} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className={`btn ms-3 ${autoRotate ? 'btn-info' : 'btn-primary'}`}
                    onClick={() => setAutoRotate((value) => !value)}
                    aria-label="Toggle automatic rotation"
                    aria-pressed={autoRotate}
                    title="Toggle automatic rotation"
                  >
                    <Rotate3D size={16} aria-hidden="true" /> Auto-rotate
                  </button>
                  <button type="button" className="btn btn-primary"
                    onClick={() => setResetNonce((value) => value + 1)}
                    aria-label="Reset view" title="Reset view">
                    <RotateCcw size={16} aria-hidden="true" /> Reset view
                  </button>
                  <Form.Label htmlFor="solid-color" className="visually-hidden">Color</Form.Label>
                  <Form.Control type="color" id="solid-color" size="sm" className="ms-2" value={color}
                    title="Solid color" onChange={(event) => setColor(event.target.value)} />
                  <button className="btn btn-primary btn-sm ms-2" aria-label="Toggle face opacity" title="Face opacity" aria-expanded={showDisplay} aria-controls="display-settings" onClick={() => setShowDisplay((value) => !value)}><Blend size={16} /></button>
                </ButtonGroup>
              </Col>

              <Col xs={12} md={3} className="text-md-end">
                <div className="d-flex gap-2 justify-content-md-end flex-wrap">
                  <button className="btn btn-primary btn-sm" disabled={dualTransition} onClick={() => setShowMap(true)}><Network size={16} /> Map</button>
                  <button className="btn btn-primary btn-sm" disabled={dualTransition} onClick={() => setShowHistory(true)}><History size={16} /> History</button>
                </div>
              </Col>
            </Row>
            <div className="d-flex gap-2 justify-content-center flex-wrap mt-2" role="group" aria-label="Solid transformations">
                  <button
                    type="button"
                    className="btn btn-info btn-sm px-3 py-2 text-nowrap"
                    onClick={() => startDualTransition('dual')}
                    disabled={dualTransition}
                    aria-label="Dual"
                    title={`Show dual: ${getSolid(solid.dualId).name}`}
                  >
                    <RefreshCw size={16} aria-hidden="true" /> Dual → {getSolid(solid.dualId).name}
                  </button>
                <div className="d-flex">
                  <button
                    type="button"
                    className="btn btn-warning btn-sm px-3 py-2 text-nowrap"
                    aria-label={unstellate ? 'Unstellate' : 'Stellate'}
                    disabled={dualTransition || !stellationDestination}
                    onClick={() => startDualTransition('stellate')}
                    title={stellationTargets[solidId] ? `Transform to ${getSolid(stellationTargets[solidId]!).name}` : 'No regular Kepler–Poinsot stellation for this solid'}
                  >
                    <Sparkles size={16} aria-hidden="true" /> {stellationDestination ? `${unstellate ? 'Unstellate' : 'Stellate'} → ${getSolid(stellationDestination).name}` : 'No regular stellation'}
                  </button>
                  <Dropdown>
                    <Dropdown.Toggle variant="warning" size="sm" className="h-100" split aria-label="Choose stellation destination"
                      disabled={dualTransition || !routesFrom(solidId).some((route) => route.kind === 'stellate')} />
                    <Dropdown.Menu>
                      {routesFrom(solidId).filter((route) => route.kind === 'stellate').map((route) => (
                        <Dropdown.Item key={route.destination} disabled={!route.implemented} onClick={() => startDualTransition('stellate',route.destination)}>
                          {getSolid(route.destination).name}{route.stages ? ` · ${route.stages}-stage route` : ''}
                        </Dropdown.Item>
                      ))}
                    </Dropdown.Menu>
                  </Dropdown>
                </div>
            </div>
            <Collapse in={showDisplay}>
              <div id="display-settings">
                <Form.Label htmlFor="opacity" className="small mb-0 mt-2">Face opacity: {Math.round(opacity*100)}%</Form.Label>
                <Form.Range id="opacity" min={0.2} max={1} step={0.05} value={opacity} onChange={(event) => setOpacity(Number(event.target.value))} />
              </div>
            </Collapse>
            <Row className="align-items-center g-2 mt-1">
              <Col xs={12}>
                <TransformationPlayer originId={originId} destinationId={destinationId} progress={progress} playing={playing} kind={kind} onSeek={seek}
                  duration={duration} onDurationChange={setDuration}
                  onExplain={() => { setPlaying(false); setShowExplanation(true) }}
                  onPlay={() => {
                      if (playing) setPlaying(false)
                      else if (progress > 0 && progress < 1) setPlaying(true)
                      else startDualTransition(kind,progress === 1 ? originId : destinationId)
                    }} />
              </Col>
            </Row>
          </Card.Header>

          <Card.Body className="p-0 bg-body position-relative flex-grow-1 overflow-hidden">
            <SolidScene
              key={selectionKey}
              solidId={solid.id}
              solidName={solid.name}
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
        activeRoute={[originId,destinationId]} onInspect={changeSolid} onTransform={startDualTransition} />
      <TransformationExplanation show={showExplanation} onHide={() => setShowExplanation(false)} originId={originId} destinationId={destinationId} progress={progress} kind={kind} />
      <Modal show={showHistory} onHide={() => setShowHistory(false)} centered scrollable aria-labelledby="history-title">
        <Modal.Header closeButton closeVariant="white"><Modal.Title id="history-title">Route history</Modal.Title></Modal.Header>
        <Modal.Body>
          <div className="d-flex gap-2 mb-3">
            <button className="btn btn-primary btn-sm" disabled={history.index <= 0} onClick={() => restoreStop(history.index-1)}><ArrowLeft size={16} /> Back</button>
            <button className="btn btn-primary btn-sm" disabled={history.index >= history.entries.length-1} onClick={() => restoreStop(history.index+1)}>Forward <ArrowRight size={16} /></button>
          </div>
          <ListGroup>{history.entries.map((entry,index) => (
            <ListGroup.Item key={`${entry.signature}:${index}`} action active={index === history.index}
              onClick={() => restoreStop(index)}>{index+1}. {getSolid(entry.solidId).name}</ListGroup.Item>
          ))}</ListGroup>
        </Modal.Body>
      </Modal>
    </div>
  )
}

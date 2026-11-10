import {
  Github,
  Pause,
  Play,
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
  Col,
  Container,
  Dropdown,
  Form,
  Navbar,
  Row,
  Stack,
} from 'react-bootstrap'
import { SolidScene } from './components/SolidScene'
import { stellationTargets, type TransformationKind } from './three/transformations'
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

export function App() {
  const [saved] = useState(readSettings)
  const [solidId, setSolidId] = useState<SolidId>(() => initialSolid(saved).id)
  const [autoRotate, setAutoRotate] = useState(saved.autoRotate)
  const [originId, setOriginId] = useState<SolidId>(() => initialSolid(saved).id)
  const [progress, setProgress] = useState(0)
  const progressRef = useRef(0)
  const [playing, setPlaying] = useState(false)
  const [target, setTarget] = useState(1)
  const [kind, setKind] = useState<TransformationKind>('dual')
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
  const destinationId = kind === 'dual' ? origin.dualId : stellationTargets[originId] ?? originId
  const latestSettings = useRef<Settings>(saved)

  useEffect(() => {
    latestSettings.current = { solidId, autoRotate, duration, opacity, color, cameraPosition: cameraPosition.current }
    writeSettings(latestSettings.current)
  }, [solidId, autoRotate, duration, opacity, color])

  const saveCamera = useCallback((position: CameraPosition) => {
    cameraPosition.current = position
    latestSettings.current = { ...latestSettings.current, cameraPosition: position }
    writeSettings(latestSettings.current)
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
    setProgress(0)
    progressRef.current = 0
    setSelectionKey((value) => value + 1)
    setInitialCameraPosition(cameraPosition.current)
  }

  function startDualTransition(nextKind: TransformationKind = 'dual') {
    setAutoRotate(false)
    if (nextKind !== kind) {
      setOriginId(solidId)
      setKind(nextKind)
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

  return (
    <>
      <Navbar bg="primary" data-bs-theme="dark" className="py-1">
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

      <Container as="main" className="py-2">
        <Card className="border-0 bg-body mb-2">
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

        <Card className="border-0 bg-body">
          <Card.Header className="border-0 bg-body px-2 py-1">
            <Row className="align-items-center g-2">
              <Col xs={12} md={4}>
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

              <Col xs={12} md={4} className="text-center">
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
                </ButtonGroup>
              </Col>

              <Col xs={12} md={4} className="text-md-end">
                <ButtonGroup size="sm" aria-label="Solid transformations">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => startDualTransition('dual')}
                    disabled={dualTransition}
                    title={`Show dual: ${getSolid(solid.dualId).name}`}
                  >
                    <RefreshCw size={16} aria-hidden="true" /> Dual
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-info"
                    disabled={dualTransition || !stellationTargets[solidId]}
                    onClick={() => startDualTransition('stellate')}
                    title={stellationTargets[solidId] ? `Transform to ${getSolid(stellationTargets[solidId]!).name}` : 'No regular Kepler–Poinsot stellation for this solid'}
                  >
                    <Sparkles size={16} aria-hidden="true" /> {solid.faceType === 'Pentagram' || solidId === 'great-icosahedron' ? 'Unstellate' : 'Stellate'}
                  </button>
                </ButtonGroup>
              </Col>
            </Row>
            <Row className="align-items-center g-2 mt-1">
              <Col xs={12} md={4}>
                <div className="d-flex align-items-center justify-content-between gap-2">
                  <Form.Label htmlFor="opacity" className="small mb-0">
                    Face opacity: {Math.round(opacity * 100)}%
                  </Form.Label>
                  <Form.Label htmlFor="solid-color" className="small mb-0 ms-auto">Color</Form.Label>
                  <Form.Control type="color" id="solid-color" size="sm" value={color}
                    title="Solid color" onChange={(event) => setColor(event.target.value)} />
                </div>
                <Form.Range id="opacity" min={0.2} max={1} step={0.05} value={opacity}
                  onChange={(event) => setOpacity(Number(event.target.value))} />
              </Col>
              <Col xs={12} md={4} className="text-center">
                <Form.Label htmlFor="progress" className="small mb-0">
                  Transformation progress: {Math.round(progress * 100)}%
                </Form.Label>
                <div className="d-flex gap-2 align-items-center">
                  <button type="button" className="btn btn-primary btn-sm"
                    aria-label={playing ? 'Pause transformation' : 'Play transformation'}
                    onClick={() => {
                      if (playing) setPlaying(false)
                      else if (progress > 0 && progress < 1) setPlaying(true)
                      else startDualTransition(kind)
                    }}>
                    {playing ? <Pause size={16} /> : <Play size={16} />}
                  </button>
                  <Form.Range id="progress" min={0} max={1} step={0.01} value={progress}
                    aria-valuetext={`${Math.round(progress * 100)} percent, ${origin.name} to ${getSolid(destinationId).name}`}
                    onChange={(event) => seek(Number(event.target.value))} />
                </div>
              </Col>
              <Col xs={12} md={4}>
                <Form.Label htmlFor="duration" className="small mb-0">
                  Transformation time: {duration.toFixed(1)} s
                </Form.Label>
                <Form.Range id="duration" min={0.5} max={6} step={0.1} value={duration}
                  disabled={playing} onChange={(event) => setDuration(Number(event.target.value))} />
              </Col>
            </Row>
          </Card.Header>

          <Card.Body className="p-0 bg-body">
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
            />
          </Card.Body>
        </Card>
      </Container>
    </>
  )
}

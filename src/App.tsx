import {
  Github,
  Pause,
  Play,
  RefreshCw,
  RotateCcw,
  Sparkles,
  ZoomIn,
  ZoomOut,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { version } from '../package.json'
import {
  Badge,
  ButtonGroup,
  Card,
  Col,
  Container,
  Dropdown,
  Navbar,
  Row,
  Stack,
} from 'react-bootstrap'
import { SolidScene } from './components/SolidScene'
import {
  getSolid,
  plannedStarSolids,
  solids,
  type SolidDefinition,
  type SolidId,
} from './data/solids'

function initialSolid(): SolidDefinition {
  return getSolid(new URLSearchParams(window.location.search).get('solid'))
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
  const [solidId, setSolidId] = useState<SolidId>(() => initialSolid().id)
  const [autoRotate, setAutoRotate] = useState(false)
  const [dualTransition, setDualTransition] = useState(false)
  const [selectionKey, setSelectionKey] = useState(0)
  const [resetNonce, setResetNonce] = useState(0)
  const [zoom, setZoom] = useState<{
    nonce: number
    direction: 'in' | 'out'
  }>({ nonce: 0, direction: 'in' })
  const solid = getSolid(solidId)

  useEffect(() => {
    const url = new URL(window.location.href)
    url.searchParams.set('solid', solidId)
    window.history.replaceState({}, '', url)
  }, [solidId])

  function changeSolid(nextId: SolidId) {
    if (dualTransition) return
    setSolidId(nextId)
    setSelectionKey((value) => value + 1)
    setResetNonce((value) => value + 1)
  }

  function startDualTransition() {
    setAutoRotate(false)
    setDualTransition(true)
  }

  function completeDualTransition() {
    setSolidId(solid.dualId)
    setDualTransition(false)
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
                    {solids.map((option) => (
                      <Dropdown.Item
                        key={option.id}
                        active={option.id === solidId}
                        onClick={() => changeSolid(option.id)}
                      >
                        {option.name}
                      </Dropdown.Item>
                    ))}
                    <Dropdown.Divider />
                    <Dropdown.Header>Kepler–Poinsot · coming next</Dropdown.Header>
                    {plannedStarSolids.map((name) => (
                      <Dropdown.Item key={name} disabled>
                        {name}
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
                    onClick={() => setResetNonce((value) => value + 1)}
                    aria-label="Reset view"
                    title="Reset view"
                  >
                    <RotateCcw size={16} aria-hidden="true" />
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
                    className={`btn ${autoRotate ? 'btn-info' : 'btn-primary'}`}
                    onClick={() => setAutoRotate((value) => !value)}
                    aria-label="Toggle automatic rotation"
                    aria-pressed={autoRotate}
                    title="Toggle automatic rotation"
                  >
                    {autoRotate ? (
                      <Pause size={16} aria-hidden="true" />
                    ) : (
                      <Play size={16} aria-hidden="true" />
                    )}
                  </button>
                </ButtonGroup>
              </Col>

              <Col xs={12} md={4} className="text-md-end">
                <ButtonGroup size="sm" aria-label="Solid transformations">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={startDualTransition}
                    disabled={dualTransition}
                    title={`Show dual: ${getSolid(solid.dualId).name}`}
                  >
                    <RefreshCw size={16} aria-hidden="true" /> Dual
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-info"
                    disabled
                    title="Stellation geometry is planned for the next milestone"
                  >
                    <Sparkles size={16} aria-hidden="true" /> Stellate
                  </button>
                </ButtonGroup>
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
              dualTransition={dualTransition}
              onDualComplete={completeDualTransition}
            />
          </Card.Body>
        </Card>
      </Container>
    </>
  )
}

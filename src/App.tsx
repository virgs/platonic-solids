import {
  ExternalLink,
  Github,
  Minus,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  ZoomIn,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import {
  Accordion,
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
    <Col xs={6} md={4} lg={3}>
      <div className="text-body-secondary small">{label}</div>
      <div className="fw-semibold">{value}</div>
    </Col>
  )
}

export function App() {
  const [solidId, setSolidId] = useState<SolidId>(() => initialSolid().id)
  const [autoRotate, setAutoRotate] = useState(true)
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
    setSolidId(nextId)
    setResetNonce((value) => value + 1)
  }

  function changeZoom(direction: 'in' | 'out') {
    setZoom((current) => ({ nonce: current.nonce + 1, direction }))
  }

  return (
    <>
      <Navbar bg="primary" data-bs-theme="dark" expand="md">
        <Container>
          <Navbar.Brand href="./" className="fw-semibold">
            Platonic Solids Explorer
          </Navbar.Brand>
          <Stack direction="horizontal" gap={2}>
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

      <Container as="main" className="py-4">
        <header className="mb-4">
          <Badge bg="info" text="dark" className="mb-2">
            Interactive geometry
          </Badge>
          <h1 className="display-6 mb-2">Meet the regular polyhedra</h1>
          <p className="lead text-body-secondary mb-0">
            Orbit each solid, compare its properties, and discover its dual.
            Every model shares the same circumradius.
          </p>
        </header>

        <Card className="shadow mb-4">
          <Card.Header>
            <Stack
              direction="horizontal"
              gap={2}
              className="justify-content-between flex-wrap"
            >
              <Dropdown>
                <Dropdown.Toggle variant="primary" id="solid-selector">
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

              <ButtonGroup aria-label="Camera controls">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => changeZoom('out')}
                  aria-label="Zoom out"
                  title="Zoom out"
                >
                  <Minus size={18} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setResetNonce((value) => value + 1)}
                >
                  <RotateCcw size={18} aria-hidden="true" /> Reset
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => changeZoom('in')}
                  aria-label="Zoom in"
                  title="Zoom in"
                >
                  <ZoomIn size={18} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className={`btn ${autoRotate ? 'btn-info' : 'btn-outline-secondary'}`}
                  onClick={() => setAutoRotate((value) => !value)}
                  aria-pressed={autoRotate}
                >
                  {autoRotate ? (
                    <Pause size={18} aria-hidden="true" />
                  ) : (
                    <Play size={18} aria-hidden="true" />
                  )}{' '}
                  Rotate
                </button>
              </ButtonGroup>
            </Stack>
          </Card.Header>

          <Card.Body className="p-0">
            <SolidScene
              solidId={solid.id}
              solidName={solid.name}
              autoRotate={autoRotate}
              resetNonce={resetNonce}
              zoom={zoom}
            />
          </Card.Body>

          <Card.Footer>
            <Stack
              direction="horizontal"
              gap={2}
              className="justify-content-center flex-wrap"
            >
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => changeSolid(solid.dualId)}
              >
                Show dual: {getSolid(solid.dualId).name}
              </button>
              <button
                type="button"
                className="btn btn-outline-info"
                disabled
                title="Stellation geometry is planned for the next milestone"
              >
                <Sparkles size={18} aria-hidden="true" /> Stellate
              </button>
            </Stack>
            <p className="text-center text-body-secondary small mt-2 mb-0">
              Drag to orbit · Scroll or pinch to zoom
            </p>
          </Card.Footer>
        </Card>

        <Card className="shadow-sm mb-4">
          <Card.Body>
            <Stack
              direction="horizontal"
              className="justify-content-between align-items-start flex-wrap mb-3"
              gap={2}
            >
              <div>
                <div className="text-info small fw-semibold text-uppercase">
                  {solid.family}
                </div>
                <h2 className="mb-1">{solid.name}</h2>
                {solid.alternateName && (
                  <div className="text-body-secondary">{solid.alternateName}</div>
                )}
              </div>
              <Badge bg="secondary" className="fs-5">
                {solid.symbol}
              </Badge>
            </Stack>

            <Row className="g-3 mb-4">
              <Property label="Faces" value={solid.faces} />
              <Property label="Edges" value={solid.edges} />
              <Property label="Vertices" value={solid.vertices} />
              <Property label="Face" value={solid.faceType} />
              <Property label="Face angle" value={solid.faceAngle} />
              <Property label="Dihedral angle" value={solid.dihedralAngle} />
              <Property label="Dual" value={getSolid(solid.dualId).name} />
              <Property label="Circumradius" value="1 (normalized)" />
            </Row>

            <Accordion flush>
              <Accordion.Item eventKey="details">
                <Accordion.Header>More details</Accordion.Header>
                <Accordion.Body>
                  <p>{solid.description}</p>
                  <Row className="g-3 mb-3">
                    <Property
                      label="Vertex configuration"
                      value={solid.vertexConfiguration}
                    />
                    <Property label="Symmetry" value={solid.symmetry} />
                    <Property label="Convexity" value="Convex" />
                    <Property label="Euler characteristic" value="2" />
                  </Row>
                  <a
                    className="btn btn-outline-info"
                    href={solid.wikipediaUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Read on Wikipedia{' '}
                    <ExternalLink size={16} aria-hidden="true" />
                  </a>
                </Accordion.Body>
              </Accordion.Item>
            </Accordion>
          </Card.Body>
        </Card>
      </Container>
    </>
  )
}

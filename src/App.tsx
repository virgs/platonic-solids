import { Github, Minus, Pause, Play, RotateCcw, Sparkles, ZoomIn } from 'lucide-react'
import { useEffect, useState } from 'react'
import {
  Badge,
  ButtonGroup,
  Card,
  Container,
  Dropdown,
  Navbar,
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
      <Navbar bg="primary" data-bs-theme="dark" className="py-1">
        <Container>
          <Navbar.Brand href="./" className="fw-semibold py-1">
            Platonic Solids Explorer
          </Navbar.Brand>
          <a
            className="btn btn-outline-light btn-sm"
            href="https://github.com/virgs/platonic-solids"
            target="_blank"
            rel="noreferrer"
          >
            <Github size={16} aria-hidden="true" /> GitHub
          </a>
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
            <Stack
              direction="horizontal"
              gap={2}
              className="justify-content-between align-items-center flex-wrap"
            >
              <Dropdown>
                <Dropdown.Toggle variant="primary" size="sm" id="solid-selector">
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

              <Stack direction="horizontal" gap={2} className="flex-wrap ms-auto">
                <ButtonGroup size="sm" aria-label="Camera controls">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => changeZoom('out')}
                    aria-label="Zoom out"
                    title="Zoom out"
                  >
                    <Minus size={16} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setResetNonce((value) => value + 1)}
                    aria-label="Reset view"
                    title="Reset view"
                  >
                    <RotateCcw size={16} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => changeZoom('in')}
                    aria-label="Zoom in"
                    title="Zoom in"
                  >
                    <ZoomIn size={16} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className={`btn ${autoRotate ? 'btn-info' : 'btn-outline-secondary'}`}
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

                <ButtonGroup size="sm" aria-label="Solid transformations">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => changeSolid(solid.dualId)}
                    title={`Show dual: ${getSolid(solid.dualId).name}`}
                  >
                    Dual
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
              </Stack>
            </Stack>
          </Card.Header>

          <Card.Body className="p-0 bg-body">
            <SolidScene
              solidId={solid.id}
              solidName={solid.name}
              autoRotate={autoRotate}
              resetNonce={resetNonce}
              zoom={zoom}
            />
          </Card.Body>
        </Card>
      </Container>
    </>
  )
}

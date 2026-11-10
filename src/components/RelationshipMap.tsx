import { Col, Form, ListGroup, Modal, Row } from 'react-bootstrap'
import { getSolid, solids, type SolidId } from '../data/solids'
import { routes, routesFrom } from '../data/routes'
import type { TransformationKind } from '../three/transformations'

const positions: Record<SolidId, [number, number]> = {
  tetrahedron: [125,70], cube: [125,225], octahedron: [125,365],
  dodecahedron: [400,70], icosahedron: [765,70],
  'small-stellated-dodecahedron': [400,220], 'great-dodecahedron': [400,370],
  'great-stellated-dodecahedron': [765,370], 'great-icosahedron': [765,220],
}
export function RelationshipMap({ show, onHide, current, activeRoute, onInspect, onTransform }: {
  show: boolean; onHide: () => void; current: SolidId
  activeRoute: [SolidId, SolidId]
  onInspect: (id: SolidId) => void
  onTransform: (kind: TransformationKind) => void
}) {
  return <Modal show={show} onHide={onHide} size="xl" scrollable centered aria-labelledby="map-title">
    <Modal.Header closeButton closeVariant="white"><Modal.Title id="map-title">Transformation map</Modal.Title></Modal.Header>
    <Modal.Body>
      <div className="d-flex gap-3 small flex-wrap mb-2">
        <span className="text-info">Blue: dual</span><span className="text-warning">Gold: stellation</span>
        <span className="text-body-secondary">Dashed: planned</span>
      </div>
      <Row className="g-3 align-items-center"><Col xs={12} md={8}>
      <svg viewBox="0 0 920 440" width="100%" role="group" aria-label="Relationships between all nine solids">
        {routes.map((route) => {
          const [x,y] = positions[route.from]; const [xx,yy] = positions[route.to]
          const active = (activeRoute[0] === route.from && activeRoute[1] === route.to) || (activeRoute[1] === route.from && activeRoute[0] === route.to)
          const path = route.from === route.to ? `M ${x-35} ${y-20} C ${x-110} ${y-70}, ${x+110} ${y-70}, ${x+35} ${y-20}`
            : !route.implemented ? `M ${x} ${y} Q ${x+150} ${(y+yy)/2} ${xx} ${yy}`
            : `M ${x} ${y} L ${xx} ${yy}`
          return <path key={`${route.from}:${route.to}:${route.kind}`} d={path} fill="none"
            stroke={!route.implemented ? '#adb5bd' : route.kind === 'dual' ? '#3498db' : '#f39c12'}
            strokeWidth={active ? 5 : 2} strokeDasharray={route.implemented ? undefined : '6 7'}>
            <title>{`${getSolid(route.from).name} ↔ ${getSolid(route.to).name}: ${route.kind}${route.implemented ? '' : ' (planned)'}`}</title>
          </path>
        })}
        {solids.map((solid) => {
          const [x,y] = positions[solid.id]
          const words = solid.name.split(' ')
          const lines = words.length > 2 ? [words.slice(0,-1).join(' '), words.at(-1)!] : [solid.name]
          return <g key={solid.id} role="button" tabIndex={0} aria-label={`Inspect ${solid.name}`}
            onClick={() => onInspect(solid.id)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onInspect(solid.id) } }}>
            <rect x={x-115} y={y-28} width={230} height={56} rx={10}
              fill={solid.id === current ? '#375a7f' : '#303030'} stroke={solid.id === current ? '#4cc9f0' : '#adb5bd'} strokeWidth={solid.id === current ? 3 : 1} />
            {lines.map((line,i) => <text key={line} x={x} y={y+(lines.length === 1 ? 5 : -3+i*18)} textAnchor="middle" fill="#f8f9fa" fontSize={14}>{line}</text>)}
          </g>
        })}
      </svg>
      </Col><Col xs={12} md={4}>
      <Form.Label htmlFor="map-solid">Inspect a solid</Form.Label>
      <Form.Select id="map-solid" value={current} className="mb-3" onChange={(event) => onInspect(event.target.value as SolidId)}>
        {solids.map((solid) => <option key={solid.id} value={solid.id}>{solid.name}</option>)}
      </Form.Select>
      <h2 className="h6">From {getSolid(current).name}</h2>
      <ListGroup>
        {routesFrom(current).map((route) => <ListGroup.Item key={`${route.kind}:${route.destination}`} action disabled={!route.implemented}
          onClick={() => { onHide(); onTransform(route.kind) }}>
          {route.kind === 'dual' ? 'Dual' : 'Stellation'} → {getSolid(route.destination).name}{route.implemented ? '' : ' · Planned'}
        </ListGroup.Item>)}
      </ListGroup>
      </Col></Row>
    </Modal.Body>
  </Modal>
}

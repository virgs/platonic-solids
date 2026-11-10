import { Col, Form, ListGroup, Modal, Row } from 'react-bootstrap'
import { getSolid, solids, type SolidId } from '../data/solids'
import { routeLabel, routes, routesFrom, type Route } from '../data/routes'
import type { TransformationKind } from '../three/transformations'
import { DialogCloseButton } from './DialogCloseButton'
import { Diamond, Scissors, Star } from 'lucide-react'

const positions: Record<SolidId, [number, number]> = {
  tetrahedron: [150,590], cube: [150,100], octahedron: [150,410], cuboctahedron: [420,255],
  dodecahedron: [800,210], icosahedron: [1110,210], icosidodecahedron: [955,70],
  'small-stellated-dodecahedron': [620,430], 'great-dodecahedron': [800,620],
  'great-stellated-dodecahedron': [1110,620], 'great-icosahedron': [1160,430],
}
const styles = {
  dual: { color: '#3498db', dash: undefined, icon: Diamond },
  stellate: { color: '#f39c12', dash: '10 5', icon: Star },
  rectify: { color: '#00bc8c', dash: '12 4 2 4', icon: Scissors },
}

function edgeShape(route: Route): { path: string; middle: [number,number] } {
  const [x,y] = positions[route.from], [xx,yy] = positions[route.to]
  if (route.from === route.to) return { path: `M ${x-120} ${y-12} C 10 ${y-65}, 10 ${y+65}, ${x-120} ${y+12}`, middle: [15,y] }
  const dx = xx-x, dy = yy-y
  const f = Math.min(dx ? 120/Math.abs(dx) : Infinity,dy ? 33/Math.abs(dy) : Infinity)
  return { path: `M ${x+dx*f} ${y+dy*f} L ${xx-dx*f} ${yy-dy*f}`, middle: [(x+xx)/2,(y+yy)/2] }
}
export function RelationshipMap({ show, onHide, current, activeRoute, onInspect, onTransform }: {
  show: boolean; onHide: () => void; current: SolidId
  activeRoute: [SolidId, SolidId]
  onInspect: (id: SolidId) => void
  onTransform: (kind: TransformationKind, destination?: SolidId) => void
}) {
  return <Modal show={show} onHide={onHide} size="xl" fullscreen="lg-down" scrollable centered aria-labelledby="map-title">
    <Modal.Header><Modal.Title id="map-title">Transformation map</Modal.Title><DialogCloseButton title="Close map" onClick={onHide} /></Modal.Header>
    <Modal.Body>
      <div className="d-flex gap-3 small flex-wrap mb-2">
        <span className="text-info"><Diamond size={16} aria-hidden="true" /> Solid line: dual</span>
        <span className="text-warning"><Star size={16} aria-hidden="true" /> Dashed: stellation</span>
        <span className="text-success"><Scissors size={16} aria-hidden="true" /> Dash-dot: rectification</span>
      </div>
      <Row className="g-3 align-items-center"><Col xs={12} lg={9}>
      <svg viewBox="0 0 1320 700" width="100%" role="group" aria-label={`Relationships between all ${solids.length} solids`}>
        <defs>
          {Object.entries(styles).map(([id,{ color }]) => (
            <marker key={id} id={`map-arrow-${id}`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="12" markerHeight="12" markerUnits="userSpaceOnUse" orient="auto-start-reverse">
              <path d="M 1 1 L 9 5 L 1 9 Z" fill={color} />
            </marker>
          ))}
        </defs>
        {routes.map((route) => {
          const active = (activeRoute[0] === route.from && activeRoute[1] === route.to) || (activeRoute[1] === route.from && activeRoute[0] === route.to)
          const shape = edgeShape(route)
          const style = route.kind
          const appearance = styles[style]
          const Icon = appearance.icon
          const marker = `url(#map-arrow-${style})`
          return <g key={`${route.from}:${route.to}:${route.kind}`}>
            <path d={shape.path} fill="none" data-route-kind={style}
              stroke={appearance.color}
              strokeWidth={active ? 4 : 2} strokeDasharray={appearance.dash}
              markerStart={marker} markerEnd={marker}>
              <title>{`${getSolid(route.from).name} ↔ ${getSolid(route.to).name}: ${route.kind}`}</title>
            </path>
            <circle cx={shape.middle[0]} cy={shape.middle[1]} r="13" fill="#303030" />
            <Icon x={shape.middle[0]-9} y={shape.middle[1]-9} width={18} height={18} stroke="#f8f9fa" aria-hidden="true" />
          </g>
        })}
        {solids.map((solid) => {
          const [x,y] = positions[solid.id]
          const words = solid.name.split(' ')
          const lines = words.length > 2 ? [words.slice(0,-1).join(' '), words.at(-1)!] : [solid.name]
          return <g key={solid.id} role="button" tabIndex={0} aria-label={`Inspect ${solid.name}`}
            onClick={() => onInspect(solid.id)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onInspect(solid.id) } }}>
            <title>Inspect {solid.name}</title>
            <rect x={x-115} y={y-28} width={230} height={56} rx={10}
              fill={solid.id === current ? '#375a7f' : '#303030'} stroke={solid.id === current ? '#4cc9f0' : '#adb5bd'} strokeWidth={solid.id === current ? 3 : 1} />
            {lines.map((line,i) => <text key={line} x={x} y={y+(lines.length === 1 ? 6 : -4+i*22)} textAnchor="middle" fill="#f8f9fa" fontSize={18}>{line}</text>)}
          </g>
        })}
      </svg>
      </Col><Col xs={12} lg={3}>
      <Form.Label htmlFor="map-solid">Inspect a solid</Form.Label>
      <Form.Select id="map-solid" value={current} className="mb-3" onChange={(event) => onInspect(event.target.value as SolidId)}>
        {solids.map((solid) => <option key={solid.id} value={solid.id}>{solid.name}</option>)}
      </Form.Select>
      <h2 className="h6">From {getSolid(current).name}</h2>
      <ListGroup>
        {routesFrom(current).map((route) => <ListGroup.Item key={`${route.kind}:${route.destination}`} title={`Transform to ${getSolid(route.destination).name}`} action disabled={!route.implemented}
          onClick={() => { onHide(); onTransform(route.kind,route.destination) }}>
          {routeLabel(route.kind,current,route.destination)} → {getSolid(route.destination).name}
        </ListGroup.Item>)}
      </ListGroup>
      </Col></Row>
    </Modal.Body>
  </Modal>
}

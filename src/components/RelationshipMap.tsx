import { Badge, Col, Form, ListGroup, Modal, Row } from 'react-bootstrap'
import { getSolid, solids, type SolidId } from '../data/solids'
import { families } from '../data/families'
import { routeLabel, routes, routesFrom, type Route } from '../data/routes'
import type { TransformationKind } from '../three/transformations'
import { DialogCloseButton } from './DialogCloseButton'
import { Diamond, Scissors, Slice, Star } from 'lucide-react'

const positions: Record<SolidId, [number, number]> = {
  cube: [340,300], octahedron: [340,700], tetrahedron: [340,1000], cuboctahedron: [760,500],
  'truncated-cube': [760,230], 'truncated-octahedron': [760,770], 'truncated-tetrahedron': [150,850],
  'rhombic-dodecahedron': [1060,500], 'triakis-octahedron': [1060,230],
  'tetrakis-hexahedron': [1060,770], 'triakis-tetrahedron': [150,600],
  dodecahedron: [1520,500], icosahedron: [1940,500], icosidodecahedron: [1730,200],
  'truncated-dodecahedron': [1370,250], 'truncated-icosahedron': [2090,250],
  'rhombic-triacontahedron': [1730,60], 'triakis-icosahedron': [1370,60], 'pentakis-dodecahedron': [2090,60],
  'small-stellated-dodecahedron': [1370,760], 'great-dodecahedron': [1520,1000],
  'great-stellated-dodecahedron': [1940,1000], 'great-icosahedron': [2090,760],
}
const styles = {
  truncate: { color: '#adb5bd', dash: '3 5', icon: Slice },
  dual: { color: '#3498db', dash: undefined, icon: Diamond },
  stellate: { color: '#f39c12', dash: '10 5', icon: Star },
  rectify: { color: '#00bc8c', dash: '12 4 2 4', icon: Scissors },
}

function edgeShape(route: Route): { path: string; middle: [number,number] } {
  const [x,y] = positions[route.from], [xx,yy] = positions[route.to]
  if (route.from === route.to) return { path: `M ${x-120} ${y-12} C 10 ${y-65}, 10 ${y+65}, ${x-120} ${y+12}`, middle: [(x-120)/4+7.5,y] }
  const dx = xx-x, dy = yy-y
  const f = Math.min(dx ? 120/Math.abs(dx) : Infinity,dy ? 45/Math.abs(dy) : Infinity)
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
        <span><Slice size={16} aria-hidden="true" /> Short dash: truncation</span>
      </div>
      <div className="d-flex align-items-center gap-2 flex-wrap small mb-2" aria-label="Solid families">
        <span>Solid families:</span>{Object.entries(families).map(([family,appearance]) => <Badge key={family} bg={appearance.badge}>{appearance.label}</Badge>)}
      </div>
      <Row className="g-3 align-items-center"><Col xs={12}>
      <svg viewBox="0 0 2260 1100" width="100%" role="group" aria-label={`Relationships between all ${solids.length} solids`}>
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
          const family = families[solid.family]
          const words = solid.name.split(' ')
          const lines = words.length > 2 ? [words.slice(0,-1).join(' '), words.at(-1)!] : [solid.name]
          return <g key={solid.id} role="button" tabIndex={0} aria-label={`Inspect ${solid.name}`} aria-describedby={`map-family-${solid.id}`}
            onClick={() => onInspect(solid.id)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onInspect(solid.id) } }}>
            <title>Inspect {solid.name} · {family.label}</title>
            <rect x={x-115} y={y-40} width={230} height={80} rx={10}
              fill={solid.id === current ? '#375a7f' : '#303030'} stroke={solid.id === current ? '#4cc9f0' : family.color} strokeWidth={solid.id === current ? 3 : 1} />
            {lines.map((line,i) => <text key={line} x={x} y={y+(lines.length === 1 ? -5 : -18+i*22)} textAnchor="middle" fill="#f8f9fa" fontSize={20}>{line}</text>)}
            <text id={`map-family-${solid.id}`} x={x} y={y+27} textAnchor="middle" fill={family.color} fontSize={16} data-family-label={solid.family}>{family.label}</text>
          </g>
        })}
      </svg>
      </Col><Col xs={12} lg={4}>
      <Form.Label htmlFor="map-solid">Inspect a solid</Form.Label>
      <Form.Select id="map-solid" value={current} className="mb-3" onChange={(event) => onInspect(event.target.value as SolidId)}>
        {Object.entries(families).map(([family,appearance]) => <optgroup key={family} label={appearance.label}>{solids.filter(solid=>solid.family===family).map(solid=><option key={solid.id} value={solid.id}>{solid.name}</option>)}</optgroup>)}
      </Form.Select>
      <Badge bg={families[getSolid(current).family].badge}>{families[getSolid(current).family].label}</Badge>
      </Col><Col xs={12} lg={8}>
      <h2 className="h6">From {getSolid(current).name}</h2>
      <ListGroup className="flex-row flex-wrap gap-2">
        {routesFrom(current).map((route) => <ListGroup.Item className="border rounded w-auto" key={`${route.kind}:${route.destination}`} title={`Transform to ${getSolid(route.destination).name}`} action disabled={!route.implemented}
          onClick={() => { onHide(); onTransform(route.kind,route.destination) }}>
          {routeLabel(route.kind,current,route.destination)} → {getSolid(route.destination).name}
        </ListGroup.Item>)}
      </ListGroup>
      </Col></Row>
    </Modal.Body>
  </Modal>
}

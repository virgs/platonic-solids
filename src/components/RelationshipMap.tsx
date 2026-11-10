import { Col, Form, ListGroup, Modal, Row } from 'react-bootstrap'
import { getSolid, solids, type SolidId } from '../data/solids'
import { routes, routesFrom, type Route } from '../data/routes'
import type { TransformationKind } from '../three/transformations'

const positions: Record<SolidId, [number, number]> = {
  tetrahedron: [125,70], cube: [125,225], octahedron: [125,365],
  dodecahedron: [400,70], icosahedron: [765,70],
  'small-stellated-dodecahedron': [400,220], 'great-dodecahedron': [400,370],
  'great-stellated-dodecahedron': [765,370], 'great-icosahedron': [765,220],
}

function edgeShape(route: Route): { path: string; middle: [number,number] } {
  const [x,y] = positions[route.from], [xx,yy] = positions[route.to]
  if (route.from === route.to) return { path: `M ${x-35} ${y-33} C ${x-110} ${y-60}, ${x+110} ${y-60}, ${x+35} ${y-33}`, middle: [x,y-53] }
  if (route.stages === 2) return { path: `M ${x-120} ${y} C ${x-140} ${y}, ${x-140} ${yy}, ${xx-120} ${yy}`, middle: [x-135,(y+yy)/2] }
  if (route.stages === 3) return { path: `M ${x+80} ${y+33} L 595 135 L 595 300 L ${xx} 300 L ${xx} ${yy-33}`, middle: [595,285] }
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
  return <Modal show={show} onHide={onHide} size="xl" scrollable centered aria-labelledby="map-title">
    <Modal.Header closeButton closeVariant="white"><Modal.Title id="map-title">Transformation map</Modal.Title></Modal.Header>
    <Modal.Body>
      <div className="d-flex gap-3 small flex-wrap mb-2">
        <span className="text-info">◇ Solid line: dual</span><span className="text-warning">★ Dashed: stellation</span>
        <span>②/③ Dotted: staged route</span><span>Arrowheads at both ends: reversible</span>
      </div>
      <Row className="g-3 align-items-center"><Col xs={12} md={8}>
      <svg viewBox="0 0 920 440" width="100%" role="group" aria-label="Relationships between all nine solids">
        <defs>
          {[['dual','#3498db'],['stellate','#f39c12'],['staged','#adb5bd']].map(([id,color]) => (
            <marker key={id} id={`map-arrow-${id}`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="12" markerHeight="12" markerUnits="userSpaceOnUse" orient="auto-start-reverse">
              <path d="M 1 1 L 9 5 L 1 9 Z" fill={color} />
            </marker>
          ))}
        </defs>
        {routes.map((route) => {
          const active = (activeRoute[0] === route.from && activeRoute[1] === route.to) || (activeRoute[1] === route.from && activeRoute[0] === route.to)
          const shape = edgeShape(route)
          const style = route.stages ? 'staged' : route.kind
          const marker = `url(#map-arrow-${style})`
          return <g key={`${route.from}:${route.to}:${route.kind}`}>
            <path d={shape.path} fill="none" data-route-kind={style}
              stroke={route.stages ? '#adb5bd' : route.kind === 'dual' ? '#3498db' : '#f39c12'}
              strokeWidth={active ? 4 : 2} strokeDasharray={route.stages ? '2 6' : route.kind === 'stellate' ? '10 5' : undefined}
              markerStart={marker} markerEnd={marker}>
              <title>{`${getSolid(route.from).name} ↔ ${getSolid(route.to).name}: ${route.stages ? `${route.stages}-stage route` : route.kind}`}</title>
            </path>
            <circle cx={shape.middle[0]} cy={shape.middle[1]} r="11" fill="#303030" />
            <text x={shape.middle[0]} y={shape.middle[1]+5} textAnchor="middle" fill="#f8f9fa" fontSize="16">{route.stages ?? (route.kind === 'dual' ? '◇' : '★')}</text>
          </g>
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
          onClick={() => { onHide(); onTransform(route.kind,route.destination) }}>
          {route.kind === 'dual' ? 'Dual' : 'Stellation'} → {getSolid(route.destination).name}{route.stages ? ` · ${route.stages}-stage route` : ''}
        </ListGroup.Item>)}
      </ListGroup>
      </Col></Row>
    </Modal.Body>
  </Modal>
}

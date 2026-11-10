import { CloseButton, Col, Form, ListGroup, Modal, Row } from 'react-bootstrap'
import { getSolid, solids, type SolidId } from '../data/solids'
import { routeLabel, routes, routesFrom, type Route } from '../data/routes'
import type { TransformationKind } from '../three/transformations'

const positions: Record<SolidId, [number, number]> = {
  tetrahedron: [150,70], cube: [150,250], octahedron: [150,550], cuboctahedron: [430,400],
  dodecahedron: [800,70], icosahedron: [1100,70], icosidodecahedron: [950,235],
  'small-stellated-dodecahedron': [700,400], 'great-dodecahedron': [700,570],
  'great-stellated-dodecahedron': [1100,570], 'great-icosahedron': [1100,400],
}
const styles = {
  dual: { color: '#3498db', dash: undefined, symbol: '◇' },
  stellate: { color: '#f39c12', dash: '10 5', symbol: '★' },
  rectify: { color: '#00bc8c', dash: '12 4 2 4', symbol: '✂' },
}

function edgeShape(route: Route): { path: string; middle: [number,number] } {
  const [x,y] = positions[route.from], [xx,yy] = positions[route.to]
  if (route.from === route.to) return { path: `M ${x-35} ${y-33} C ${x-110} ${y-60}, ${x+110} ${y-60}, ${x+35} ${y-33}`, middle: [x,y-53] }
  if (route.kind === 'rectify' && route.from === 'tetrahedron') return { path: `M ${x-120} ${y} C 10 ${y}, 10 ${yy}, ${xx-120} ${yy}`, middle: [15,310] }
  if (route.from === 'dodecahedron' && route.to === 'great-dodecahedron') return { path: `M ${x-120} ${y} L 580 150 L 580 ${yy} L ${xx-120} ${yy}`, middle: [580,350] }
  if (route.from === 'dodecahedron' && route.to === 'great-stellated-dodecahedron') return { path: `M ${x-80} ${y+33} L 560 160 L 560 650 L ${xx} 650 L ${xx} ${yy+33}`, middle: [850,650] }
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
    <Modal.Header><Modal.Title id="map-title">Transformation map</Modal.Title><CloseButton title="Close map" onClick={onHide} /></Modal.Header>
    <Modal.Body>
      <div className="d-flex gap-3 small flex-wrap mb-2">
        <span className="text-info">◇ Solid line: dual</span><span className="text-warning">★ Dashed: stellation</span>
        <span className="text-success">✂ Dash-dot: rectification</span>
      </div>
      <Row className="g-3 align-items-center"><Col xs={12} lg={9}>
      <svg viewBox="0 0 1260 700" width="100%" role="group" aria-label={`Relationships between all ${solids.length} solids`}>
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
          const marker = `url(#map-arrow-${style})`
          return <g key={`${route.from}:${route.to}:${route.kind}`}>
            <path d={shape.path} fill="none" data-route-kind={style}
              stroke={appearance.color}
              strokeWidth={active ? 4 : 2} strokeDasharray={appearance.dash}
              markerStart={marker} markerEnd={marker}>
              <title>{`${getSolid(route.from).name} ↔ ${getSolid(route.to).name}: ${route.kind}`}</title>
            </path>
            <circle cx={shape.middle[0]} cy={shape.middle[1]} r="11" fill="#303030" />
            <text x={shape.middle[0]} y={shape.middle[1]+5} textAnchor="middle" fill="#f8f9fa" fontSize="16">{appearance.symbol}</text>
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
            {lines.map((line,i) => <text key={line} x={x} y={y+(lines.length === 1 ? 5 : -3+i*18)} textAnchor="middle" fill="#f8f9fa" fontSize={14}>{line}</text>)}
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

import { useRef } from 'react'
import { Palette, RefreshCw, Rotate3D, RotateCcw, Scissors, Slice, Sparkles, ZoomIn, ZoomOut } from 'lucide-react'
import { ButtonGroup, Dropdown, Form } from 'react-bootstrap'
import { getSolid, type SolidDefinition, type SolidId } from '../data/solids'
import { routeLabel, routesFrom } from '../data/routes'
import { rectificationTargets } from '../three/rectification'
import { stellationTargets, type TransformationKind } from '../three/transformations'
import { OpacityControl } from './OpacityControl'

export function ViewerToolbar({ solid, disabled, autoRotate, onRotate, onReset, onZoom, color, onColor, opacity, onOpacity, showOpacity, onToggleOpacity, onTransform }: {
  solid: SolidDefinition; disabled: boolean; autoRotate: boolean; onRotate: () => void; onReset: () => void; onZoom: (direction: 'in'|'out') => void
  color: string; onColor: (value: string) => void; opacity: number; onOpacity: (value: number) => void
  showOpacity: boolean; onToggleOpacity: (show: boolean) => void; onTransform: (kind: TransformationKind, destination?: SolidId) => void
}) {
  const colorInput=useRef<HTMLInputElement>(null)
  const routes=routesFrom(solid.id)
  const stellar=routes.filter(route=>route.kind==='stellate'), rectifying=routes.filter(route=>route.kind==='rectify')
  const rectification=rectifying.find(route=>route.destination===rectificationTargets[solid.id]) ?? rectifying[0]
  const truncation=routes.find(route=>route.kind==='truncate')
  const unstellate=solid.faceType==='Pentagram' || solid.id==='great-icosahedron'
  const operationClass='btn btn-warning btn-sm px-1 px-lg-2 text-nowrap'
  return <div className="d-flex align-items-center justify-content-between flex-nowrap" role="toolbar" aria-label="Solid controls">
    <ButtonGroup size="sm" aria-label="Camera controls" className="flex-shrink-0">
      <button type="button" className="btn btn-primary px-1 px-lg-2" aria-label="Zoom out" title="Zoom out" onClick={()=>onZoom('out')}><ZoomOut size={16} aria-hidden="true" /></button>
      <button type="button" className="btn btn-primary px-1 px-lg-2" aria-label="Zoom in" title="Zoom in" onClick={()=>onZoom('in')}><ZoomIn size={16} aria-hidden="true" /></button>
      <button type="button" className={`btn d-none d-lg-inline-block ms-1 ${autoRotate ? 'btn-info' : 'btn-primary'}`} aria-label="Toggle automatic rotation" aria-pressed={autoRotate} title="Toggle automatic rotation" onClick={onRotate}><Rotate3D size={16} aria-hidden="true" /> Auto-rotate</button>
      <button type="button" className="btn btn-primary d-none d-lg-inline-block" aria-label="Reset view" title="Reset view" onClick={onReset}><RotateCcw size={16} aria-hidden="true" /> Reset view</button>
      <Form.Label htmlFor="solid-color" role="button" tabIndex={0} aria-label="Choose solid color" title="Solid color" data-testid="solid-color-button" className="btn btn-primary btn-sm px-1 px-lg-2 position-relative mb-0 focus-ring"
        onKeyDown={event=>{if(event.key==='Enter' || event.key===' '){event.preventDefault();colorInput.current?.click()}}}>
        <Palette size={16} fill={color} aria-hidden="true" />
        <Form.Control ref={colorInput} type="color" id="solid-color" aria-label="Color" title="Solid color" tabIndex={-1} className="position-absolute top-0 start-0 w-100 h-100 opacity-0" value={color} onChange={event=>onColor(event.target.value)} />
      </Form.Label>
      <OpacityControl value={opacity} onChange={onOpacity} show={showOpacity} onToggle={onToggleOpacity} />
    </ButtonGroup>
    <div className="d-flex align-items-stretch gap-1 flex-nowrap flex-shrink-0" role="group" aria-label="Solid transformations">
      {solid.dualId && <button type="button" className={operationClass} aria-label="Dual" title={`Show dual: ${getSolid(solid.dualId).name}`} disabled={disabled} onClick={()=>onTransform('dual')}><RefreshCw size={16} aria-hidden="true" /><span className="d-none d-lg-inline"> Dual</span></button>}
      {stellar.length>0 && <div className="d-flex">
        <button type="button" className={operationClass} aria-label={unstellate ? 'Unstellate' : 'Stellate'} title={`Transform to ${getSolid(stellationTargets[solid.id]!).name}`} disabled={disabled} onClick={()=>onTransform('stellate')}><Sparkles size={16} aria-hidden="true" /><span className="d-none d-lg-inline"> {unstellate ? 'Unstellate' : 'Stellate'}</span></button>
        {stellar.length>1 && <Dropdown>
          <Dropdown.Toggle variant="warning" size="sm" className="h-100 px-1 px-lg-2" split aria-label="Choose stellation destination" title="Choose a stellation" disabled={disabled} />
          <Dropdown.Menu popperConfig={{strategy:'fixed'}}>{stellar.map(route=><Dropdown.Item key={route.destination} title={`Transform to ${getSolid(route.destination).name}`} onClick={()=>onTransform('stellate',route.destination)}>{getSolid(route.destination).name}</Dropdown.Item>)}</Dropdown.Menu>
        </Dropdown>}
      </div>}
      {rectification && <div className="d-flex">
        <button type="button" className={operationClass} aria-label={routeLabel('rectify',solid.id,rectification.destination)} title={`Transform to ${getSolid(rectification.destination).name}`} disabled={disabled} onClick={()=>onTransform('rectify',rectification.destination)}><Scissors size={16} aria-hidden="true" /><span className="d-none d-lg-inline"> {routeLabel('rectify',solid.id,rectification.destination)}</span></button>
        {rectifying.length>1 && <Dropdown>
          <Dropdown.Toggle variant="warning" size="sm" className="h-100 px-1 px-lg-2" split aria-label="Choose rectification destination" title="Choose a rectification" disabled={disabled} />
          <Dropdown.Menu popperConfig={{strategy:'fixed'}}>{rectifying.map(route=><Dropdown.Item key={route.destination} title={`Transform to ${getSolid(route.destination).name}`} onClick={()=>onTransform('rectify',route.destination)}>{routeLabel('rectify',solid.id,route.destination)} → {getSolid(route.destination).name}</Dropdown.Item>)}</Dropdown.Menu>
        </Dropdown>}
      </div>}
      {truncation && <button type="button" className={operationClass} aria-label={routeLabel('truncate',solid.id,truncation.destination)} title={`Transform to ${getSolid(truncation.destination).name}`} disabled={disabled} onClick={()=>onTransform('truncate',truncation.destination)}><Slice size={16} aria-hidden="true" /><span className="d-none d-lg-inline"> {routeLabel('truncate',solid.id,truncation.destination)}</span></button>}
    </div>
  </div>
}

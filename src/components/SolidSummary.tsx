import { useState, type ReactNode } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Badge, Col, Row } from 'react-bootstrap'
import type { Highlight } from '../three/highlights'
import { getSolid, type SolidDefinition } from '../data/solids'

/** Bootstrap-only line slots keep the model and controls still as values change. */
function Property({ label,value,multiline = false, action }: { label: string; value: ReactNode; multiline?: boolean; action?: { active: boolean; disabled: boolean; toggle: () => void } }) {
  const content = <>
    <div className="text-body-secondary">{label}</div>
    <div className="position-relative fw-semibold">
      <div className="invisible" aria-hidden="true">&nbsp;{multiline && <><br className="d-lg-none" /><span className="d-lg-none">&nbsp;</span></>}</div>
      <div className="position-absolute top-0 start-0 w-100" data-testid="property-value">{value}</div>
    </div>
  </>
  return action ? <button type="button" data-property={label} className={`btn btn-sm p-0 border-0 text-start lh-sm ${action.active ? 'btn-info' : 'btn-link link-info text-decoration-none'}`} aria-label={`Highlight ${label.toLowerCase()}`} title={`Highlight ${label.toLowerCase()} on the solid`} aria-pressed={action.active} disabled={action.disabled} onClick={action.toggle}>{content}</button> : <div data-property={label}>{content}</div>
}

export function SolidSummary({ solid, highlight, onHighlight, disabled }: { solid: SolidDefinition; highlight: Highlight; onHighlight: (highlight: Highlight) => void; disabled: boolean }) {
  const [expanded, setExpanded] = useState(false)
  const detailsClass = expanded ? '' : 'd-none d-lg-block'
  const action = (value: Exclude<Highlight,null>) => ({ active: highlight === value, disabled, toggle: () => onHighlight(highlight === value ? null : value) })
  const dual = solid.dualName ?? (solid.dualId ? getSolid(solid.dualId).name : '—')
  return <section className="small" aria-label="Solid properties" data-testid="solid-summary">
    <div className="d-flex align-items-center gap-2">
      <div className="flex-grow-1">
        <div className="text-info small fw-semibold text-uppercase text-nowrap">{solid.family}</div>
        <div className="position-relative">
          <div className="h4 mb-0 invisible" aria-hidden="true">&nbsp;<br className="d-lg-none" /><span className="d-lg-none">&nbsp;</span></div>
          <h1 className="h4 mb-0 position-absolute top-0 start-0 w-100">{solid.name}</h1>
        </div>
      </div>
      <Badge bg="secondary">{solid.symbol}</Badge>
    </div>
    <div className="lh-sm mt-2">
      <Row className="g-1">
        <Col xs={12} lg={4}>
          <div className="d-flex justify-content-between gap-2">
            <Property label="Faces" value={solid.faces} action={action('faces')} />
            <Property label="Edges" value={solid.edges} action={action('edges')} />
            <Property label="Vertices" value={solid.vertices} action={action('vertices')} />
            <div className={detailsClass}><Property label="Dihedral" value={solid.dihedralAngle} /></div>
            <button type="button" className="btn btn-primary btn-sm d-lg-none align-self-center" aria-label={expanded ? 'Show fewer properties' : 'Show all properties'} title={expanded ? 'Show fewer properties' : 'Show all properties'} aria-expanded={expanded} onClick={() => setExpanded(value => !value)}>{expanded ? <ChevronUp size={16} aria-hidden="true" /> : <ChevronDown size={16} aria-hidden="true" />}</button>
          </div>
        </Col>
        <Col xs={6} lg={4} className={detailsClass}><Property label="Face types" value={solid.faceBreakdown ?? solid.faceType} multiline /></Col>
        <Col xs={6} lg={4} className={detailsClass}><Property label="Face angles" value={solid.faceAngle} multiline /></Col>
      </Row>
      <Row className={`g-1 mt-1 ${expanded ? '' : 'd-none d-lg-flex'}`}>
        <Col xs={3} lg={2}><Property label="At vertex" value={solid.vertexConfiguration} /></Col>
        <Col xs={6} lg={8}><Property label="Dual" value={dual} multiline /></Col>
        <Col xs={3} lg={2}><Property label="Reference" value={<a className="link-info" href={solid.wikipediaUrl} target="_blank" rel="noreferrer" title="Read about this solid">Wikipedia</a>} /></Col>
      </Row>
    </div>
  </section>
}

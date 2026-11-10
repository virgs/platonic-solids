import type { ReactNode } from 'react'
import { Badge, Col, Row } from 'react-bootstrap'
import { getSolid, type SolidDefinition } from '../data/solids'

/** Bootstrap-only line slots keep the model and controls still as values change. */
function Property({ label,value,multiline = false }: { label: string; value: ReactNode; multiline?: boolean }) {
  return <div data-property={label}>
    <div className="text-body-secondary">{label}</div>
    <div className="position-relative fw-semibold">
      <div className="invisible" aria-hidden="true">&nbsp;{multiline && <><br className="d-lg-none" /><span className="d-lg-none">&nbsp;</span></>}</div>
      <div className="position-absolute top-0 start-0 w-100" data-testid="property-value">{value}</div>
    </div>
  </div>
}

export function SolidSummary({ solid }: { solid: SolidDefinition }) {
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
        <Col xs={12} lg={3}>
          <div className="d-flex justify-content-between gap-2">
            <Property label="Faces" value={solid.faces} />
            <Property label="Edges" value={solid.edges} />
            <Property label="Vertices" value={solid.vertices} />
            <Property label="Dihedral" value={solid.dihedralAngle} />
          </div>
        </Col>
        <Col xs={6} lg={4}><Property label="Face types" value={solid.faceBreakdown ?? solid.faceType} multiline /></Col>
        <Col xs={6} lg={5}><Property label="Face angles" value={solid.faceAngle} multiline /></Col>
      </Row>
      <Row className="g-1 mt-1">
        <Col xs={3} lg={2}><Property label="At vertex" value={solid.vertexConfiguration} /></Col>
        <Col xs={6} lg={8}><Property label="Dual" value={dual} multiline /></Col>
        <Col xs={3} lg={2}><Property label="Reference" value={<a className="link-info" href={solid.wikipediaUrl} target="_blank" rel="noreferrer" title="Read about this solid">Wikipedia</a>} /></Col>
      </Row>
    </div>
  </section>
}

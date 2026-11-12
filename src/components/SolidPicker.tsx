import { useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Dropdown, Form } from 'react-bootstrap'
import { solids, type SolidDefinition, type SolidId } from '../data/solids'
import { families } from '../data/families'

export function SolidPicker({ solid, disabled, onSelect }: { solid: SolidDefinition; disabled: boolean; onSelect: (id: SolidId) => void }) {
  const [show, setShow] = useState(false)
  const toggle = useRef<HTMLButtonElement>(null)
  return <Dropdown show={show} onToggle={setShow} autoClose="outside" className="position-static">
    <div className="position-relative">
      <div className="h4 mb-0 invisible" aria-hidden="true">&nbsp;<br className="d-lg-none" /><span className="d-lg-none">&nbsp;</span></div>
      <h1 className="h4 mb-0 position-absolute top-0 start-0 w-100" aria-label={solid.name}>
        <Dropdown.Toggle ref={toggle} id="solid-selector" variant="link" bsPrefix="btn" disabled={disabled}
          className="d-block w-100 p-0 border-0 text-body text-decoration-none fw-semibold fs-4 lh-1 text-start"
          aria-label="Choose a solid" title={`Choose a solid: ${solid.name}`}>
          <span className="d-flex align-items-center gap-1"><span className="overflow-hidden text-break">{solid.name}</span>{show ? <ChevronUp size={18} className="flex-shrink-0" aria-hidden="true" /> : <ChevronDown size={18} className="flex-shrink-0" aria-hidden="true" />}</span>
        </Dropdown.Toggle>
      </h1>
    </div>
    {createPortal(<Dropdown.Menu className="p-2 w-auto" popperConfig={{ strategy: 'fixed' }}>
      <Form.Label htmlFor="solid-catalog" className="small mb-1">Choose a solid</Form.Label>
      <Form.Select id="solid-catalog" aria-label="Solid catalog" title="Choose a solid" htmlSize={9} value={solid.id} disabled={disabled}
        onKeyDown={event => {
          event.stopPropagation()
          if (event.key === 'Escape') { event.preventDefault(); setShow(false); toggle.current?.focus() }
        }}
        onChange={event => { onSelect(event.target.value as SolidId); setShow(false); toggle.current?.focus() }}>
        {Object.entries(families).map(([family, appearance]) => <optgroup key={family} label={appearance.label}>
          {solids.filter(option => option.family === family).map(option => <option key={option.id} value={option.id}>{option.name}</option>)}
        </optgroup>)}
      </Form.Select>
    </Dropdown.Menu>, document.body)}
  </Dropdown>
}

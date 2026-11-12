import { useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Dropdown } from 'react-bootstrap'
import { solids, type SolidDefinition, type SolidId } from '../data/solids'
import { families } from '../data/families'

export function SolidPicker({ solid, disabled, onSelect }: { solid: SolidDefinition; disabled: boolean; onSelect: (id: SolidId) => void }) {
  const [show, setShow] = useState(false)
  const toggle = useRef<HTMLButtonElement>(null)
  return <Dropdown show={show} onToggle={setShow} focusFirstItemOnShow="keyboard" className="position-static">
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
    {createPortal(<Dropdown.Menu id="solid-catalog" role="menu"
      className="h-50 overflow-y-auto mw-100" popperConfig={{ strategy: 'fixed' }}>
      {Object.entries(families).map(([family, appearance]) => <div key={family} role="group" aria-label={appearance.label}>
        <Dropdown.Header>{appearance.label}</Dropdown.Header>
        {solids.filter(option => option.family === family).map(option => <Dropdown.Item
          key={option.id} as="button" role="menuitemradio" data-solid-id={option.id}
          active={option.id === solid.id} aria-checked={option.id === solid.id}
          disabled={disabled} className="text-wrap" title={`Show ${option.name}`}
          onClick={() => { setShow(false); toggle.current?.focus(); onSelect(option.id) }}>
          {option.name}
        </Dropdown.Item>)}
      </div>)}
    </Dropdown.Menu>, document.body)}
  </Dropdown>
}

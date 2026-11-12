import { Contrast } from 'lucide-react'
import { Dropdown } from 'react-bootstrap'
import { VerticalSlider } from './VerticalSlider'

export function OpacityControl({ value, onChange, show, onToggle }: {
  value: number; onChange: (value: number) => void; show: boolean; onToggle: (show: boolean) => void
}) {
  return <Dropdown show={show} onToggle={onToggle} className="ms-1 ms-lg-2">
    <Dropdown.Toggle id="opacity-button" variant="primary" size="sm" className="h-100 px-1 px-lg-2 text-nowrap" bsPrefix="btn"
      aria-label="Toggle solid opacity" title="Solid opacity">
      <Contrast size={16} aria-hidden="true" /> {Math.round(value*100)}%
    </Dropdown.Toggle>
    <Dropdown.Menu popperConfig={{strategy:'fixed'}} renderOnMount className="p-2 text-center" aria-labelledby="opacity-button">
      <div className="small text-nowrap">Solid opacity: {Math.round(value*100)}%</div>
      <VerticalSlider label="Solid opacity" value={value} min={0.2} max={1} step={0.01}
        format={(next) => `${Math.round(next*100)}%`} onChange={onChange} />
    </Dropdown.Menu>
  </Dropdown>
}

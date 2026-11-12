import { Timer } from 'lucide-react'
import { Dropdown } from 'react-bootstrap'
import { VerticalSlider } from './VerticalSlider'

export function TimingControl({ value, disabled, onChange }: { value: number; disabled: boolean; onChange: (value: number) => void }) {
  return <Dropdown>
    <Dropdown.Toggle id="timing-button" variant="primary" size="sm" disabled={disabled}
      aria-label="Adjust transformation time" title={`Transformation time: ${value.toFixed(1)} seconds`}>
      <Timer size={16} /> {value.toFixed(1)} s
    </Dropdown.Toggle>
    <Dropdown.Menu popperConfig={{strategy:'fixed'}} renderOnMount className="p-2 text-center" aria-labelledby="timing-button">
      <div className="small text-nowrap">Transformation time</div>
      <VerticalSlider label="Transformation time" value={value} min={0.5} max={10} step={0.1}
        disabled={disabled} format={(next) => `${next} s`} onChange={onChange} />
      <div className="small">{value.toFixed(1)} seconds</div>
    </Dropdown.Menu>
  </Dropdown>
}

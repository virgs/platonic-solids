import { Timer } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { Dropdown } from 'react-bootstrap'

/** SVG provides a vertical slider without introducing project CSS or inline styles. */
export function TimingControl({ value, disabled, onChange }: { value: number; disabled: boolean; onChange: (value: number) => void }) {
  const slider = useRef<SVGSVGElement>(null)
  const setValue = (next: number) => onChange(Math.max(0.5,Math.min(10,Math.round(next*10)/10)))
  const fromPointer = (clientY: number, element: SVGSVGElement) => {
    const box = element.getBoundingClientRect()
    const y = (clientY-box.top)*200/box.height
    setValue(0.5+(180-Math.max(20,Math.min(180,y)))/160*9.5)
  }
  useEffect(() => {
    const element = slider.current
    if (!element) return
    const touch = (event: TouchEvent) => {
      if (disabled || !event.touches.length) return
      event.preventDefault()
      const box = element.getBoundingClientRect()
      const y = (event.touches[0].clientY-box.top)*200/box.height
      onChange(Math.max(0.5,Math.min(10,Math.round((0.5+(180-Math.max(20,Math.min(180,y)))/160*9.5)*10)/10)))
    }
    element.addEventListener('touchstart',touch,{ passive: false })
    element.addEventListener('touchmove',touch,{ passive: false })
    return () => { element.removeEventListener('touchstart',touch); element.removeEventListener('touchmove',touch) }
  }, [disabled,onChange])
  // Keep the slider mounted while its Bootstrap menu is hidden so native touch
  // listeners attach once and remain available when the popup is opened.
  return <Dropdown>
    <Dropdown.Toggle id="timing-button" variant="primary" size="sm" disabled={disabled}
      aria-label="Adjust transformation time" title={`Transformation time: ${value.toFixed(1)} seconds`}>
      <Timer size={16} /> {value.toFixed(1)} s
    </Dropdown.Toggle>
    <Dropdown.Menu renderOnMount className="p-2 text-center" aria-labelledby="timing-button">
      <div className="small text-nowrap">Transformation time</div>
      <svg ref={slider} viewBox="0 0 90 200" width="90" height="200" role="slider" tabIndex={disabled ? -1 : 0}
        aria-label="Transformation time" aria-orientation="vertical" aria-valuemin={0.5} aria-valuemax={10}
        aria-valuenow={value} aria-valuetext={`${value.toFixed(1)} seconds`} aria-disabled={disabled}
        onKeyDown={(event) => {
          if (disabled) return
          const next = event.key === 'Home' ? 0.5 : event.key === 'End' ? 10
            : ['ArrowUp','ArrowRight'].includes(event.key) ? value+0.1 : ['ArrowDown','ArrowLeft'].includes(event.key) ? value-0.1
            : event.key === 'PageUp' ? value+0.5 : event.key === 'PageDown' ? value-0.5 : undefined
          if (next !== undefined) { event.preventDefault(); event.stopPropagation(); setValue(next) }
        }}
        onPointerDown={(event) => {
          if (disabled || event.pointerType === 'touch') return
          event.preventDefault(); event.currentTarget.setPointerCapture(event.pointerId)
          fromPointer(event.clientY,event.currentTarget)
        }}
        onPointerMove={(event) => { if (!disabled && event.pointerType !== 'touch' && event.buttons === 1) fromPointer(event.clientY,event.currentTarget) }}>
        <text x="45" y="12" textAnchor="middle" fill="currentColor" fontSize="12">10 s</text>
        <line x1="45" x2="45" y1="20" y2="180" stroke="currentColor" strokeOpacity="0.3" strokeWidth="6" strokeLinecap="round" />
        <line className="text-info" x1="45" x2="45" y1={180-(value-0.5)/9.5*160} y2="180" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
        <circle className="text-info" cx="45" cy={180-(value-0.5)/9.5*160} r="10" fill="currentColor" />
        <text x="45" y="198" textAnchor="middle" fill="currentColor" fontSize="12">0.5 s</text>
      </svg>
      <div className="small">{value.toFixed(1)} seconds</div>
    </Dropdown.Menu>
  </Dropdown>
}

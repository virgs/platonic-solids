import { useEffect, useRef } from 'react'

/** SVG keeps vertical controls accessible without adding authored stylesheets. */
export function VerticalSlider({ label, value, min, max, step, disabled = false, format, onChange }: {
  label: string; value: number; min: number; max: number; step: number; disabled?: boolean
  format: (value: number) => string; onChange: (value: number) => void
}) {
  const slider = useRef<SVGSVGElement>(null)
  const normalize = (next: number) => Math.max(min,Math.min(max,Number((min+Math.round((next-min)/step)*step).toFixed(6))))
  const fromPointer = (clientY: number, element: SVGSVGElement) => {
    const box = element.getBoundingClientRect()
    const y = (clientY-box.top)*200/box.height
    onChange(normalize(min+(180-Math.max(20,Math.min(180,y)))/160*(max-min)))
  }
  useEffect(() => {
    const element = slider.current
    if (!element) return
    const touch = (event: TouchEvent) => {
      if (disabled || !event.touches.length) return
      event.preventDefault()
      const box = element.getBoundingClientRect()
      const y = (event.touches[0].clientY-box.top)*200/box.height
      const next = min+(180-Math.max(20,Math.min(180,y)))/160*(max-min)
      onChange(Math.max(min,Math.min(max,Number((min+Math.round((next-min)/step)*step).toFixed(6)))))
    }
    element.addEventListener('touchstart',touch,{ passive: false })
    element.addEventListener('touchmove',touch,{ passive: false })
    return () => { element.removeEventListener('touchstart',touch); element.removeEventListener('touchmove',touch) }
  }, [disabled,min,max,step,onChange])
  const position = 180-(value-min)/(max-min)*160
  return <svg ref={slider} viewBox="0 0 90 200" width="90" height="200" role="slider" tabIndex={disabled ? -1 : 0}
    aria-label={label} aria-orientation="vertical" aria-valuemin={min} aria-valuemax={max}
    aria-valuenow={value} aria-valuetext={format(value)} aria-disabled={disabled}
    onKeyDown={(event) => {
      if (disabled) return
      const next = event.key === 'Home' ? min : event.key === 'End' ? max
        : ['ArrowUp','ArrowRight'].includes(event.key) ? value+step : ['ArrowDown','ArrowLeft'].includes(event.key) ? value-step
        : event.key === 'PageUp' ? value+step*5 : event.key === 'PageDown' ? value-step*5 : undefined
      if (next !== undefined) { event.preventDefault(); event.stopPropagation(); onChange(normalize(next)) }
    }}
    onPointerDown={(event) => {
      if (disabled || event.pointerType === 'touch') return
      event.preventDefault(); event.currentTarget.setPointerCapture(event.pointerId)
      fromPointer(event.clientY,event.currentTarget)
    }}
    onPointerMove={(event) => { if (!disabled && event.pointerType !== 'touch' && event.buttons === 1) fromPointer(event.clientY,event.currentTarget) }}>
    <text x="45" y="12" textAnchor="middle" fill="currentColor" fontSize="12">{format(max)}</text>
    <line x1="45" x2="45" y1="20" y2="180" stroke="currentColor" strokeOpacity="0.3" strokeWidth="6" strokeLinecap="round" />
    <line className="text-info" x1="45" x2="45" y1={position} y2="180" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
    <circle className="text-info" cx="45" cy={position} r="10" fill="currentColor" />
    <text x="45" y="198" textAnchor="middle" fill="currentColor" fontSize="12">{format(min)}</text>
  </svg>
}

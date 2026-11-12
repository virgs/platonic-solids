import { useRef, useState } from 'react'
import { Github, History, Menu, Network, Rotate3D, RotateCcw } from 'lucide-react'
import { Badge, Dropdown } from 'react-bootstrap'
import { version } from '../../package.json'

export function NavigationMenu({ disabled, autoRotate, onRotate, onReset, onMap, onHistory }: {
  disabled: boolean; autoRotate: boolean; onRotate: () => void; onReset: () => void; onMap: () => void; onHistory: () => void
}) {
  const [show,setShow]=useState(false)
  const toggle=useRef<HTMLButtonElement>(null)
  const run=(action:()=>void)=>{ setShow(false); toggle.current?.focus(); action() }
  return <Dropdown align="end" show={show} onToggle={setShow}>
    <Dropdown.Toggle ref={toggle} id="navigation-menu" variant="primary" size="sm" bsPrefix="btn" aria-label="Open navigation menu" title="Menu" className="px-2">
      <Menu size={20} aria-hidden="true" />
    </Dropdown.Toggle>
    <Dropdown.Menu>
      <Dropdown.Item aria-label="Map" title="Explore transformations" disabled={disabled} onClick={()=>run(onMap)}><Network size={16} aria-hidden="true" /> Map</Dropdown.Item>
      <Dropdown.Item aria-label="History" title="Revisit previous solids" disabled={disabled} onClick={()=>run(onHistory)}><History size={16} aria-hidden="true" /> History</Dropdown.Item>
      <Dropdown.Divider />
      <Dropdown.Item aria-label="Toggle automatic rotation" aria-pressed={autoRotate} active={autoRotate} title="Toggle automatic rotation" onClick={()=>run(onRotate)}><Rotate3D size={16} aria-hidden="true" /> Auto-rotate</Dropdown.Item>
      <Dropdown.Item aria-label="Reset view" title="Reset view" onClick={()=>run(onReset)}><RotateCcw size={16} aria-hidden="true" /> Reset view</Dropdown.Item>
      <Dropdown.Divider />
      <a className="dropdown-item bg-success text-white d-flex align-items-center justify-content-between gap-3" title="View source on GitHub" aria-label="GitHub" aria-describedby="app-version" href="https://github.com/virgs/platonic-solids" target="_blank" rel="noreferrer" onClick={()=>setShow(false)}>
        <span><Github size={16} aria-hidden="true" /> GitHub</span><Badge id="app-version" bg="dark">v{version}</Badge>
      </a>
    </Dropdown.Menu>
  </Dropdown>
}

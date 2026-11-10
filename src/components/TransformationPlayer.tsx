import { ChevronLeft, ChevronRight, Info, Pause, Play, SkipBack, SkipForward } from 'lucide-react'
import { Form, Modal } from 'react-bootstrap'
import { getSolid, type SolidId } from '../data/solids'
import type { TransformationKind } from '../three/transformations'
import { TimingControl } from './TimingControl'

interface RouteView { originId: SolidId; destinationId: SolidId; progress: number; kind: TransformationKind }
function checkpoints({ originId,destinationId,kind }: RouteView) {
  const cubePair = kind === 'dual' && [originId,destinationId].includes('cube') && [originId,destinationId].includes('octahedron')
  return [{ value: cubePair && originId === 'octahedron' ? 0.75 : 0.5, label: cubePair ? 'Cuboctahedron' : '' }]
}

export function TransformationPlayer(props: RouteView & {
  playing: boolean; onSeek: (value: number) => void; onPlay: () => void
  duration: number; onDurationChange: (value: number) => void
  onExplain: () => void
}) {
  const { originId,destinationId,progress,playing,onSeek,onPlay } = props
  const milestones = checkpoints(props)
  const percent = playing ? Math.min(99,Math.floor(progress*100)) : Math.round(progress*100)
  const step = (delta: number) => onSeek(Math.max(0,Math.min(1,Math.round((progress+delta)*100)/100)))
  return <div role="group" aria-label="Transformation player">
    <Form.Label htmlFor="progress" className="small mb-0">Transformation progress: {percent}%</Form.Label>
    <div className="d-flex align-items-center gap-1">
      <button className="btn btn-primary btn-sm" aria-label="Go to transformation start" onClick={() => onSeek(0)}><SkipBack size={15} /></button>
      <button className="btn btn-primary btn-sm" aria-label="Step transformation backward" onClick={() => step(-0.01)}><ChevronLeft size={15} /></button>
      <button className="btn btn-primary btn-sm" aria-label={playing ? 'Pause transformation' : 'Play transformation'} onClick={onPlay}>{playing ? <Pause size={16} /> : <Play size={16} />}</button>
      <TimingControl value={props.duration} disabled={playing} onChange={props.onDurationChange} />
      <Form.Range id="progress" min={0} max={1} step="any" list="player-milestones" value={progress}
        aria-valuetext={`${percent} percent, ${getSolid(originId).name} to ${getSolid(destinationId).name}`}
        onChange={(event) => onSeek(Number(event.target.value))} />
      <button className="btn btn-primary btn-sm" aria-label="Step transformation forward" onClick={() => step(0.01)}><ChevronRight size={15} /></button>
      <button className="btn btn-primary btn-sm" aria-label="Go to transformation end" onClick={() => onSeek(1)}><SkipForward size={15} /></button>
      <button className="btn btn-primary btn-sm" aria-label="Explain this transformation" title="How it works" onClick={props.onExplain}><Info size={16} /></button>
    </div>
    <datalist id="player-milestones"><option value="0" label="Start" />{milestones.map((point) => <option key={point.value} value={point.value} label={point.label || 'Midpoint'} />)}<option value="1" label="End" /></datalist>
    <div className="d-flex justify-content-between small text-body-secondary gap-2 flex-wrap">
      <span>{getSolid(originId).name}</span>
      <span className="text-end">{getSolid(destinationId).name}</span>
    </div>
  </div>
}

export function TransformationExplanation({ show,onHide,...props }: RouteView & { show: boolean; onHide: () => void }) {
  const { originId,destinationId,progress,kind } = props
  const milestone = checkpoints(props)[0]
  const retracting = getSolid(originId).faceType === 'Pentagram' || originId === 'great-icosahedron' || (originId === 'great-dodecahedron' && destinationId === 'dodecahedron')
  const caption = kind === 'stellate' ? retracting ? 'The extended face regions retract within their planes.' : 'The original face regions extend within their planes toward the target intersections.'
    : progress < milestone.value ? 'Corners separate and new face regions open along the original edges.' : 'The original face regions shrink toward the target vertices.'
  return <Modal show={show} onHide={onHide} centered aria-labelledby="explanation-title">
    <Modal.Header closeButton closeVariant="white"><Modal.Title id="explanation-title">How this transformation works</Modal.Title></Modal.Header>
    <Modal.Body>
      <p>{getSolid(originId).name} → {getSolid(destinationId).name}</p>
      <p>At {Math.round(progress*100)}%: {caption}</p>
      <p>{kind === 'stellate'
        ? 'Each original face grows within its existing plane. Its edges extend until the neighboring face regions meet at the target edges and vertices. This is one direct face-extension animation; reverse playback retracts the same regions.'
        : 'Faces become vertices of the dual, and vertices become faces. Corners split and move while connecting faces keep the surface continuous.'}</p>
      {milestone.label === 'Cuboctahedron' && <p>At {milestone.value*100}%, the solid is a cuboctahedron. Continuing the motion shrinks the original faces into the target’s vertices.</p>}
      <p className="mb-0">Circumradius stays normalized throughout by scaling the whole construction uniformly. Use the progress slider or 1% step buttons to examine the intermediate geometry.</p>
    </Modal.Body>
  </Modal>
}

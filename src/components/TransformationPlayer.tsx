import { ChevronLeft, ChevronRight, Info, Pause, Play, SkipBack, SkipForward } from 'lucide-react'
import { Form, Modal } from 'react-bootstrap'
import { getSolid, type SolidId } from '../data/solids'
import type { TransformationKind } from '../three/transformations'
import { TimingControl } from './TimingControl'
import { rectificationTargets } from '../three/rectification'
import { DialogCloseButton } from './DialogCloseButton'

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
      <button className="btn btn-primary btn-sm" aria-label="Go to transformation start" title="Jump to start" onClick={() => onSeek(0)}><SkipBack size={15} /></button>
      <button className="btn btn-primary btn-sm" aria-label="Step transformation backward" title="Step back 1%" onClick={() => step(-0.01)}><ChevronLeft size={15} /></button>
      <button className="btn btn-primary btn-sm" aria-label={playing ? 'Pause transformation' : 'Play transformation'} title={playing ? 'Pause' : 'Play'} onClick={onPlay}>{playing ? <Pause size={16} /> : <Play size={16} />}</button>
      <TimingControl value={props.duration} disabled={playing} onChange={props.onDurationChange} />
      <Form.Range id="progress" min={0} max={1} step="any" list="player-milestones" value={progress}
        aria-valuetext={`${percent} percent, ${getSolid(originId).name} to ${getSolid(destinationId).name}`}
        onChange={(event) => onSeek(Number(event.target.value))} />
      <button className="btn btn-primary btn-sm" aria-label="Step transformation forward" title="Step forward 1%" onClick={() => step(0.01)}><ChevronRight size={15} /></button>
      <button className="btn btn-primary btn-sm" aria-label="Go to transformation end" title="Jump to end" onClick={() => onSeek(1)}><SkipForward size={15} /></button>
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
  const pyramid = [originId,destinationId].includes('dodecahedron') && [originId,destinationId].includes('small-stellated-dodecahedron')
  const rectifying = rectificationTargets[originId] === destinationId
  const starDual = kind === 'dual' && getSolid(originId).family === 'Kepler–Poinsot polyhedron'
  const continuation = kind === 'rectify' && (originId.startsWith('truncated-') || destinationId.startsWith('truncated-'))
  const truncating = kind === 'truncate' && !originId.startsWith('truncated-')
  const caption = starDual ? 'Existing peaks retract while the dual’s peaks emerge on one connected surface, with stable planar regions.' : continuation ? 'The existing corner cuts continue toward the edge midpoints, or retract to the uniform truncated endpoint.' : kind === 'truncate' ? truncating ? 'Each corner is cut back until all remaining edges have the same length.' : 'The cut corners grow back to restore the parent solid.' : kind === 'rectify' ? rectifying ? 'The corners are cut back toward the original edge midpoints.' : 'The cut corners grow back toward the parent solid.'
    : kind === 'stellate' ? pyramid ? 'The pentagonal face centers rise into pyramid tips, or retract during reverse playback.' : 'The connected exterior reshapes as old peaks retract and target peaks emerge.'
    : progress < milestone.value ? 'Corners separate and new face regions open along the original edges.' : 'The original face regions shrink toward the target vertices.'
  return <Modal show={show} onHide={onHide} centered aria-labelledby="explanation-title">
    <Modal.Header><Modal.Title id="explanation-title">How this transformation works</Modal.Title><DialogCloseButton title="Close explanation" onClick={onHide} /></Modal.Header>
    <Modal.Body>
      <p>{getSolid(originId).name} → {getSolid(destinationId).name}</p>
      <p>At {Math.round(progress*100)}%: {caption}</p>
      <p>{starDual ? 'Polar reciprocity determines the exact dual endpoint. The animation reshapes the two exteriors directly: planar regions move continuously, without repeatedly revealing different intersecting sheets inside the solid. Reverse playback follows the identical surface path back to the original solid.' : continuation ? 'This is the same corner-cut construction as Truncate. Starting from the uniform truncated solid, the cuts continue to the original edge midpoints. Neighboring cut points meet there to form the rectified solid. The reverse stops at the uniform truncated shape, preserving the same orientation.' : kind === 'truncate'
        ? 'Truncation cuts each corner, opening one new face per original vertex. It stops before the edge midpoints, when every edge has equal length. Triangular-face parents use one third of each original edge; cube and dodecahedron cuts use 1 / (2 + 2 cos(π/p)), with p = 4 or 5. Untruncate reverses the same path without changing orientation.'
        : kind === 'rectify'
        ? 'Rectification cuts every corner back to the midpoint of each incident edge. The original faces remain, and a new face opens at each original vertex. Unrectify restores the chosen parent along the same path.'
        : kind === 'stellate' ? pyramid
          ? 'One pentagonal pyramid grows from each of the dodecahedron’s twelve faces. The face center becomes its tip, and the sides remain attached to the original boundary. Reverse playback lowers the tips back into their faces.'
          : 'One connected surface reshapes into the target exterior. Peaks and indentations move together, without detached sheets or an internal dualization stage. Reverse playback retraces the same movement.'
        : 'Faces become vertices of the dual, and vertices become faces. Corners split and move while connecting faces keep one continuous surface. Archimedean and Catalan endpoints use polar reciprocity; Catalan faces are congruent but need not be regular, and their vertices can have different radii.'}</p>
      {kind === 'stellate' && <p>The exterior stays connected throughout. The information panel counts the full mathematical faces, edges, and vertices; the visible surface patches are not additional catalog faces.</p>}
      {milestone.label === 'Cuboctahedron' && <p>At {milestone.value*100}%, the solid is a cuboctahedron. Continuing the motion shrinks the original faces into the target’s vertices.</p>}
      <p className="mb-0">Circumradius stays normalized throughout by scaling the whole construction uniformly. Use the progress slider or 1% step buttons to examine the intermediate geometry.</p>
    </Modal.Body>
  </Modal>
}

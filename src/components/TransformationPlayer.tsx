import { ChevronLeft, ChevronRight, Pause, Play, SkipBack, SkipForward, Info } from 'lucide-react'
import { useState } from 'react'
import { Form, Modal } from 'react-bootstrap'
import { getSolid, type SolidId } from '../data/solids'
import type { TransformationKind } from '../three/transformations'

export function TransformationPlayer({ originId, destinationId, progress, playing, kind, onSeek, onPlay }: {
  originId: SolidId; destinationId: SolidId; progress: number; playing: boolean
  kind: TransformationKind; onSeek: (value: number) => void; onPlay: () => void
}) {
  const [explain, setExplain] = useState(false)
  const cubePair = [originId,destinationId].includes('cube') && [originId,destinationId].includes('octahedron')
  const milestone = cubePair && kind === 'dual' && originId === 'octahedron' ? 0.75 : 0.5
  const percent = playing ? Math.min(99,Math.floor(progress*100)) : Math.round(progress*100)
  const retracting = getSolid(originId).faceType === 'Pentagram' || originId === 'great-icosahedron'
  const caption = kind === 'stellate'
    ? retracting ? 'The star regions retract toward the original face regions.' : 'The face regions extend within their planes, opening new star tips.'
    : progress < milestone ? 'Corners separate and new face regions open along the original edges.' : 'The original face regions shrink toward the target vertices.'
  return <div role="group" aria-label="Transformation player">
    <div className="d-flex justify-content-between align-items-center small gap-2">
      <Form.Label htmlFor="progress" className="mb-0">Transformation progress: {percent}%</Form.Label>
      <button className="btn btn-link btn-sm p-0" aria-label="Explain this transformation" onClick={() => { if (playing) onPlay(); setExplain(true) }}><Info size={16} /></button>
    </div>
    <div className="d-flex align-items-center gap-1">
      <button className="btn btn-primary btn-sm" aria-label="Go to transformation start" onClick={() => onSeek(0)}><SkipBack size={15} /></button>
      <button className="btn btn-primary btn-sm" aria-label="Step transformation backward" onClick={() => onSeek(Math.max(0,progress-0.01))}><ChevronLeft size={15} /></button>
      <button className="btn btn-primary btn-sm" aria-label={playing ? 'Pause transformation' : 'Play transformation'} onClick={onPlay}>{playing ? <Pause size={16} /> : <Play size={16} />}</button>
      <Form.Range id="progress" min={0} max={1} step={0.01} list="player-milestones" value={progress}
        aria-valuetext={`${percent} percent, ${getSolid(originId).name} to ${getSolid(destinationId).name}`}
        onChange={(event) => onSeek(Number(event.target.value))} />
      <button className="btn btn-primary btn-sm" aria-label="Step transformation forward" onClick={() => onSeek(Math.min(1,progress+0.01))}><ChevronRight size={15} /></button>
      <button className="btn btn-primary btn-sm" aria-label="Go to transformation end" onClick={() => onSeek(1)}><SkipForward size={15} /></button>
    </div>
    <datalist id="player-milestones"><option value="0" label="Start" /><option value={milestone} label={cubePair ? 'Cuboctahedron' : 'Midpoint'} /><option value="1" label="End" /></datalist>
    <div className="d-flex justify-content-between small text-body-secondary gap-2">
      <span>{getSolid(originId).name}</span>
      <button className="btn btn-link btn-sm p-0 text-nowrap" aria-label="Seek to transformation milestone" onClick={() => onSeek(milestone)}>{cubePair && kind === 'dual' ? `Cuboctahedron · ${milestone*100}%` : '50%'}</button>
      <span className="text-end">{getSolid(destinationId).name}</span>
    </div>
    <Modal show={explain} onHide={() => setExplain(false)} centered aria-labelledby="explanation-title">
      <Modal.Header closeButton closeVariant="white"><Modal.Title id="explanation-title">How this transformation works</Modal.Title></Modal.Header>
      <Modal.Body>
        <p>{getSolid(originId).name} → {getSolid(destinationId).name}</p>
        <p>At {percent}%: {caption}</p>
        <p>{kind === 'stellate'
          ? 'Face regions extend within their planes to create the star polyhedron. Reverse playback retracts those regions. The circumradius stays normalized throughout.'
          : 'Faces become vertices of the dual, and vertices become faces. Corners split and move while connecting faces keep the surface continuous.'}</p>
        {cubePair && kind === 'dual' && <p>At {milestone*100}%, the solid is a cuboctahedron. Continuing the motion shrinks the original faces into the target’s vertices.</p>}
        <p className="mb-0">Use the midpoint marker or 1% step buttons to examine the intermediate geometry.</p>
      </Modal.Body>
    </Modal>
  </div>
}

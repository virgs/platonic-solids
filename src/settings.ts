import { solids, type SolidId } from './data/solids'

export const SETTINGS_KEY = 'platonic-solids.settings.v1'
export type CameraPosition = [number, number, number]
export interface Settings {
  solidId: SolidId
  autoRotate: boolean
  duration: number
  opacity: number
  color: string
  cameraPosition: CameraPosition
  displayOpen: boolean
}
export const defaults: Settings = {
  solidId: 'tetrahedron', autoRotate: false, duration: 1.8,
  opacity: 0.85, color: '#4cc9f0', cameraPosition: [2.4,1.7,2.4], displayOpen: false,
}

export function parseSettings(raw: string | null): Settings {
  try {
    const value = JSON.parse(raw ?? '{}')
    if (!value || typeof value !== 'object') return { ...defaults }
    const inRange = (n: unknown, min: number, max: number, fallback: number) =>
      typeof n === 'number' && Number.isFinite(n) && n >= min && n <= max ? n : fallback
    const position = value.cameraPosition
    const validPosition = Array.isArray(position) && position.length === 3 && position.every((n) => typeof n === 'number' && Number.isFinite(n)) && Math.hypot(...position) >= 1.79 && Math.hypot(...position) <= 6.01
    return {
      solidId: solids.some((solid) => solid.id === value.solidId) ? value.solidId : defaults.solidId,
      autoRotate: typeof value.autoRotate === 'boolean' ? value.autoRotate : defaults.autoRotate,
      duration: inRange(value.duration,0.5,6,defaults.duration),
      opacity: inRange(value.opacity,0.2,1,defaults.opacity),
      color: typeof value.color === 'string' && /^#[\da-f]{6}$/i.test(value.color) ? value.color : defaults.color,
      cameraPosition: validPosition ? [position[0],position[1],position[2]] : [...defaults.cameraPosition],
      displayOpen: typeof value.displayOpen === 'boolean' ? value.displayOpen : defaults.displayOpen,
    }
  } catch {
    return { ...defaults }
  }
}

export function readSettings(): Settings {
  try { return parseSettings(localStorage.getItem(SETTINGS_KEY)) }
  catch { return { ...defaults } }
}

export function writeSettings(settings: Settings) {
  try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)) }
  catch { /* Private browsing and storage limits must not interrupt the viewer. */ }
}

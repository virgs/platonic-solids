import type { SolidFamily } from './solids'

export const families: Record<SolidFamily, { label: string; color: string; badge: string }> = {
  'Platonic solid': { label: 'Platonic', color: '#3498db', badge: 'info' },
  'Kepler–Poinsot polyhedron': { label: 'Kepler–Poinsot', color: '#adb5bd', badge: 'secondary' },
  'Archimedean solid': { label: 'Archimedean', color: '#00bc8c', badge: 'success' },
  'Catalan solid': { label: 'Catalan', color: '#f39c12', badge: 'warning' },
}

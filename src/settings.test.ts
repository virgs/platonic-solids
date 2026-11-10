import { describe, expect, it, vi, afterEach } from 'vitest'
import { defaults, parseSettings, readSettings, writeSettings, SETTINGS_KEY } from './settings'

afterEach(() => vi.unstubAllGlobals())

describe('saved preferences', () => {
  it('validates every saved value and recovers from corrupt storage', () => {
    expect(parseSettings('{')).toEqual(defaults)
    expect(parseSettings('null')).toEqual(defaults)
    expect(parseSettings(JSON.stringify({ solidId: 'missing', color: 'red', duration: -1, opacity: 3, autoRotate: 'yes', cameraPosition: [0,0,0] }))).toEqual(defaults)
  })

  it('restores valid settings including camera distance and color', () => {
    const saved = { ...defaults, solidId: 'great-icosahedron', color: '#ff6633', duration: 10, autoRotate: true, opacity: 1, cameraPosition: [0,0,5] }
    expect(parseSettings(JSON.stringify(saved))).toEqual(saved)
  })

  it('handles unavailable browser storage without breaking the viewer', () => {
    vi.stubGlobal('localStorage', { getItem: () => { throw new Error('Blocked') }, setItem: () => { throw new Error('Blocked') } })
    expect(readSettings()).toEqual(defaults)
    expect(() => writeSettings(defaults)).not.toThrow()
  })

  it('writes a versioned preferences record', () => {
    const setItem = vi.fn()
    vi.stubGlobal('localStorage', { setItem })
    writeSettings(defaults)
    expect(setItem).toHaveBeenCalledWith(SETTINGS_KEY, JSON.stringify(defaults))
  })
})

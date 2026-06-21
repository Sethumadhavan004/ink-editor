import { useRef, useEffect } from 'react'
import { Palette } from 'lucide-react'
import type { ThemeColors } from '../types'
import '../styles/floating-toolbar.css'

const SWATCHES: Record<keyof ThemeColors, string[]> = {
  canvasBg:    ['#e0ddd4', '#d6e4f0', '#e8f5e9', '#f3e5f5', '#fff8e1', '#2c2c2c'],
  paperColor:  ['#f5f4ed', '#ffffff', '#fffde7', '#fce4ec', '#e8eaf6', '#1a1a1a'],
  textColor:   ['#141413', '#111111', '#1a237e', '#4a148c', '#1b5e20', '#e0e0e0'],
  lineColor:   ['#c8c4b8', '#d0d0d0', '#b0bec5', '#ce93d8', '#a5d6a7', '#555555'],
  accentColor: ['#1b365d', '#2563eb', '#00796b', '#7b1fa2', '#e65100', '#f48fb1'],
}

const COLOR_LABELS: Record<keyof ThemeColors, string> = {
  canvasBg:    'Canvas',
  paperColor:  'Paper',
  textColor:   'Text',
  lineColor:   'Lines',
  accentColor: 'Accent',
}

const COLOR_KEYS = Object.keys(SWATCHES) as (keyof ThemeColors)[]

interface ColorPanelProps {
  colors: ThemeColors
  onChange: (c: ThemeColors) => void
  open: boolean
  onToggle: () => void
  onClose: () => void
}

export function ColorPanel({ colors, onChange, open, onToggle, onClose }: ColorPanelProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open, onClose])

  function set(key: keyof ThemeColors, value: string) {
    onChange({ ...colors, [key]: value })
  }

  return (
    <div className="ink-popover-anchor" ref={ref}>
      <button
        type="button"
        className={`ink-toolbar-btn${open ? ' ink-toolbar-btn--active' : ''}`}
        onClick={onToggle}
        aria-label="Colors"
        title="Colors"
      >
        <Palette size={16} />
      </button>
      {open && (
        <div className="ink-popover ink-popover--right ink-color-panel" role="dialog" aria-label="Color customization">
          {COLOR_KEYS.map((key) => (
            <div key={key} className="ink-color-row">
              <span className="ink-color-label">{COLOR_LABELS[key]}</span>
              <div className="ink-swatches">
                {SWATCHES[key].map((swatch) => (
                  <button
                    key={swatch}
                    type="button"
                    className={`ink-swatch${colors[key] === swatch ? ' ink-swatch--active' : ''}`}
                    style={{ background: swatch }}
                    aria-label={swatch}
                    title={swatch}
                    onClick={() => set(key, swatch)}
                  />
                ))}
                <span className="ink-color-custom" title="Custom color">
                  <input
                    type="color"
                    value={colors[key]}
                    onChange={(e) => set(key, e.target.value)}
                    aria-label={`Custom ${COLOR_LABELS[key]} color`}
                  />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

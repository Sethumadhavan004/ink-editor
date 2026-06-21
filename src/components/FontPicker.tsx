import { useRef, useEffect } from 'react'
import { Type } from 'lucide-react'
import type { FontKey } from '../types'
import '../styles/floating-toolbar.css'

export const GOOGLE_FONTS_URL =
  'https://fonts.googleapis.com/css2?family=Dancing+Script&family=Inter&family=Roboto+Slab&family=JetBrains+Mono&display=swap'

export const FONTS: Record<FontKey, { label: string; family: string }> = {
  cursive: { label: 'Cursive',  family: "'Dancing Script', cursive" },
  serif:   { label: 'Serif',    family: 'Georgia, serif' },
  sans:    { label: 'Sans',     family: "'Inter', sans-serif" },
  slab:    { label: 'Slab',     family: "'Roboto Slab', serif" },
  mono:    { label: 'Mono',     family: "'JetBrains Mono', monospace" },
}

interface FontPickerProps {
  font: FontKey
  onChange: (f: FontKey) => void
  open: boolean
  onToggle: () => void
  onClose: () => void
}

export function FontPicker({ font, onChange, open, onToggle, onClose }: FontPickerProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open, onClose])

  return (
    <div className="ink-popover-anchor" ref={ref}>
      <button
        type="button"
        className={`ink-toolbar-btn${open ? ' ink-toolbar-btn--active' : ''}`}
        onClick={onToggle}
        aria-label="Font"
        title="Font"
        style={{ width: 'auto', padding: '0 8px', gap: 4, fontSize: 13 }}
      >
        <Type size={14} />
        {FONTS[font].label}
      </button>
      {open && (
        <div className="ink-popover ink-font-picker" role="menu">
          {(Object.keys(FONTS) as FontKey[]).map((key) => (
            <button
              key={key}
              type="button"
              role="menuitem"
              className={`ink-font-option${font === key ? ' ink-font-option--active' : ''}`}
              style={{ fontFamily: FONTS[key].family }}
              onClick={() => { onChange(key); onClose() }}
            >
              {FONTS[key].label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

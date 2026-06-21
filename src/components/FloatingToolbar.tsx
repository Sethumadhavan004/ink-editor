import { useEffect, useState } from 'react'
import type { Editor } from '@tiptap/react'
import {
  Bold, Italic, Underline,
  Heading1, Heading2,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered,
  Indent, Outdent,
  Rows,
} from 'lucide-react'
import type { FontKey, ThemeColors, ToolbarKey } from '../types'
import { FontPicker, GOOGLE_FONTS_URL } from './FontPicker'
import { ColorPanel } from './ColorPanel'
import '../styles/floating-toolbar.css'

interface FloatingToolbarProps {
  editor: Editor
  buttons: ToolbarKey[]
  ruled: boolean
  onToggleRuled: () => void
  font: FontKey
  onFontChange: (f: FontKey) => void
  colors: ThemeColors
  onColorsChange: (c: ThemeColors) => void
}

type OpenPanel = 'font' | 'color' | null

function Sep() {
  return <span className="ink-toolbar-sep" aria-hidden="true" />
}

export function FloatingToolbar({
  editor,
  buttons,
  ruled,
  onToggleRuled,
  font,
  onFontChange,
  colors,
  onColorsChange,
}: FloatingToolbarProps) {
  const [openPanel, setOpenPanel] = useState<OpenPanel>(null)

  // Inject Google Fonts once on mount
  useEffect(() => {
    if (document.querySelector(`link[href="${GOOGLE_FONTS_URL}"]`)) return
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = GOOGLE_FONTS_URL
    document.head.appendChild(link)
  }, [])

  function togglePanel(panel: OpenPanel) {
    setOpenPanel((prev) => (prev === panel ? null : panel))
  }

  const iconSize = 16

  type BtnConfig = {
    label: string
    icon: React.ReactNode
    isActive: () => boolean
    action: () => void
  }

  const allGroups: { key: ToolbarKey; configs: BtnConfig[] }[] = [
    {
      key: 'bold',
      configs: [{
        label: 'Bold', icon: <Bold size={iconSize} />,
        isActive: () => editor.isActive('bold'),
        action: () => editor.chain().focus().toggleBold().run(),
      }],
    },
    {
      key: 'italic',
      configs: [{
        label: 'Italic', icon: <Italic size={iconSize} />,
        isActive: () => editor.isActive('italic'),
        action: () => editor.chain().focus().toggleItalic().run(),
      }],
    },
    {
      key: 'underline',
      configs: [{
        label: 'Underline', icon: <Underline size={iconSize} />,
        isActive: () => editor.isActive('underline'),
        action: () => editor.chain().focus().toggleUnderline().run(),
      }],
    },
    {
      key: 'h1',
      configs: [{
        label: 'Heading 1', icon: <Heading1 size={iconSize} />,
        isActive: () => editor.isActive('heading', { level: 1 }),
        action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      }],
    },
    {
      key: 'h2',
      configs: [{
        label: 'Heading 2', icon: <Heading2 size={iconSize} />,
        isActive: () => editor.isActive('heading', { level: 2 }),
        action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      }],
    },
    {
      key: 'align',
      configs: [
        { label: 'Align left', icon: <AlignLeft size={iconSize} />, isActive: () => editor.isActive({ textAlign: 'left' }), action: () => editor.chain().focus().setTextAlign('left').run() },
        { label: 'Align center', icon: <AlignCenter size={iconSize} />, isActive: () => editor.isActive({ textAlign: 'center' }), action: () => editor.chain().focus().setTextAlign('center').run() },
        { label: 'Align right', icon: <AlignRight size={iconSize} />, isActive: () => editor.isActive({ textAlign: 'right' }), action: () => editor.chain().focus().setTextAlign('right').run() },
        { label: 'Justify', icon: <AlignJustify size={iconSize} />, isActive: () => editor.isActive({ textAlign: 'justify' }), action: () => editor.chain().focus().setTextAlign('justify').run() },
      ],
    },
    {
      key: 'list',
      configs: [
        { label: 'Bullet list', icon: <List size={iconSize} />, isActive: () => editor.isActive('bulletList'), action: () => editor.chain().focus().toggleBulletList().run() },
        { label: 'Ordered list', icon: <ListOrdered size={iconSize} />, isActive: () => editor.isActive('orderedList'), action: () => editor.chain().focus().toggleOrderedList().run() },
      ],
    },
    {
      key: 'indent',
      configs: [
        { label: 'Indent', icon: <Indent size={iconSize} />, isActive: () => false, action: () => editor.chain().focus().sinkListItem('listItem').run() },
        { label: 'Outdent', icon: <Outdent size={iconSize} />, isActive: () => false, action: () => editor.chain().focus().liftListItem('listItem').run() },
      ],
    },
    {
      key: 'lines',
      configs: [{
        label: 'Toggle ruled lines', icon: <Rows size={iconSize} />,
        isActive: () => ruled,
        action: onToggleRuled,
      }],
    },
  ]

  const activeGroups = allGroups.filter((g) => buttons.includes(g.key))

  return (
    <div className="ink-floating-toolbar-wrap">
      <div className="ink-floating-toolbar" role="toolbar" aria-label="Text formatting">
        {/* Text formatting buttons */}
        {activeGroups.map((group, gi) => (
          <span key={group.key} className="ink-toolbar-group" style={{ display: 'contents' }}>
            {group.configs.map((cfg) => (
              <button
                key={cfg.label}
                type="button"
                className={`ink-toolbar-btn${cfg.isActive() ? ' ink-toolbar-btn--active' : ''}`}
                onClick={cfg.action}
                aria-label={cfg.label}
                title={cfg.label}
              >
                {cfg.icon}
              </button>
            ))}
            {gi < activeGroups.length - 1 && <Sep />}
          </span>
        ))}

        {/* Customization group */}
        {activeGroups.length > 0 && <Sep />}
        <FontPicker
          font={font}
          onChange={onFontChange}
          open={openPanel === 'font'}
          onToggle={() => togglePanel('font')}
          onClose={() => setOpenPanel(null)}
        />
        <ColorPanel
          colors={colors}
          onChange={onColorsChange}
          open={openPanel === 'color'}
          onToggle={() => togglePanel('color')}
          onClose={() => setOpenPanel(null)}
        />
      </div>
    </div>
  )
}

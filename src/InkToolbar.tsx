import { type ReactNode, type CSSProperties } from 'react'
import { useInkEditor } from './context'
import { FloatingToolbar } from './components/FloatingToolbar'
import type { ToolbarKey, ThemeColors } from './types'
import { FONTS } from './components/FontPicker'

const DEFAULT_TOOLBAR: ToolbarKey[] = [
  'bold', 'italic', 'underline', 'h1', 'h2', 'align', 'list', 'indent', 'lines',
]

export interface InkToolbarProps {
  buttons?: ToolbarKey[]
  toolbarStart?: ReactNode[]
  toolbarEnd?: ReactNode[]
  hiddenColorKeys?: (keyof ThemeColors)[]
  className?: string
  style?: CSSProperties
}

export function InkToolbar({
  buttons = DEFAULT_TOOLBAR,
  toolbarStart,
  toolbarEnd,
  hiddenColorKeys,
  className,
  style,
}: InkToolbarProps) {
  const { editor, ruled, setRuled, font, setFont, colors, setColors } = useInkEditor()

  if (!editor) return null

  const cssVars = {
    '--ink-page': colors.paperColor,
    '--ink-bg': colors.canvasBg,
    '--ink-text': colors.textColor,
    '--ink-border-line': colors.lineColor,
    '--ink-accent': colors.accentColor,
    '--ink-text-muted': colors.textColor + '99',
    '--ink-toolbar-border': colors.lineColor,
    '--ink-font-body': FONTS[font].family,
  } as CSSProperties

  return (
    <div className={className} style={{ ...cssVars, ...style }}>
      <FloatingToolbar
        editor={editor}
        buttons={buttons}
        ruled={ruled}
        onToggleRuled={() => setRuled(!ruled)}
        font={font}
        onFontChange={setFont}
        colors={colors}
        onColorsChange={setColors}
        toolbarStart={toolbarStart}
        toolbarEnd={toolbarEnd}
        hiddenColorKeys={hiddenColorKeys}
      />
    </div>
  )
}

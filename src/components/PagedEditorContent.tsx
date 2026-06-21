import { EditorContent } from '@tiptap/react'
import type { Editor } from '@tiptap/react'
import { type ReactNode } from 'react'
import { getPageWidthPx, getBodyWidthPx, getBodyHeightPx, PAGE_DIMENSIONS } from '../types'
import type { PageSize, Theme, ToolbarKey, FontKey, ThemeColors } from '../types'
import { FloatingToolbar } from './FloatingToolbar'
import { FONTS } from './FontPicker'
import '../styles/page.css'

interface Props {
  editor: Editor | null
  pageSize: PageSize
  theme: Theme
  toolbar: ToolbarKey[]
  ruled: boolean
  onToggleRuled: () => void
  font: FontKey
  onFontChange: (f: FontKey) => void
  colors: ThemeColors
  onColorsChange: (c: ThemeColors) => void
  toolbarStart?: ReactNode[]
  toolbarEnd?: ReactNode[]
  singlePage?: boolean
  hiddenColorKeys?: (keyof ThemeColors)[]
}

export function PagedEditorContent({
  editor,
  pageSize,
  theme,
  toolbar,
  ruled,
  onToggleRuled,
  font,
  onFontChange,
  colors,
  onColorsChange,
  toolbarStart,
  toolbarEnd,
  singlePage = false,
  hiddenColorKeys,
}: Props) {
  const widthPx = getPageWidthPx(pageSize)
  const bodyWidthPx = getBodyWidthPx(pageSize)
  const dims = PAGE_DIMENSIONS[pageSize]
  const pageHeightPx = Math.round(dims.heightMm * 3.7795)
  const hasToolbar = toolbar.length > 0
  const bodyHeightPx = getBodyHeightPx(pageSize)

  const cssVars = {
    '--ink-bg': colors.canvasBg,
    '--ink-page': colors.paperColor,
    '--ink-text': colors.textColor,
    '--ink-border-line': colors.lineColor,
    '--ink-accent': colors.accentColor,
    '--ink-font-body': FONTS[font].family,
  } as React.CSSProperties

  const toolbar_el = editor && hasToolbar ? (
    <FloatingToolbar
      editor={editor}
      buttons={toolbar}
      ruled={ruled}
      onToggleRuled={onToggleRuled}
      font={font}
      onFontChange={onFontChange}
      colors={colors}
      onColorsChange={onColorsChange}
      toolbarStart={toolbarStart}
      toolbarEnd={toolbarEnd}
      hiddenColorKeys={hiddenColorKeys}
    />
  ) : null

  const card_el = (
    <div
      className={`ink-page-card${ruled ? ' ink-ruled' : ''}`}
      style={{
        width: widthPx,
        ...(singlePage
          ? { height: pageHeightPx, overflow: 'hidden' }
          : { minHeight: pageHeightPx }
        ),
        padding: `${dims.paddingTopMm}mm ${dims.paddingRightMm}mm ${dims.paddingBottomMm}mm ${dims.paddingLeftMm}mm`,
        ['--ink-padding-top' as string]: `${dims.paddingTopMm}mm`,
        ['--ink-padding-right' as string]: `${dims.paddingRightMm}mm`,
        ['--ink-padding-left' as string]: `${dims.paddingLeftMm}mm`,
        ['--ink-body-width' as string]: `${bodyWidthPx}px`,
        ['--ink-body-height' as string]: `${bodyHeightPx}px`,
      }}
    >
      <EditorContent editor={editor} />
    </div>
  )

  if (singlePage) {
    // In singlePage mode: toolbar lives outside the wrap so sticky/overflow don't conflict.
    // The host controls the canvas background — we just stack toolbar + card.
    return (
      <div data-theme={theme} style={cssVars}>
        {toolbar_el}
        {card_el}
      </div>
    )
  }

  return (
    <div
      className="ink-page-wrap"
      data-theme={theme}
      style={cssVars}
    >
      {toolbar_el}
      {card_el}
    </div>
  )
}

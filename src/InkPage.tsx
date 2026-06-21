import { EditorContent } from '@tiptap/react'
import type { CSSProperties } from 'react'
import { useInkEditor } from './context'
import { getPageWidthPx, getBodyWidthPx, getBodyHeightPx, PAGE_DIMENSIONS } from './types'
import type { PageSize, Theme } from './types'
import { FONTS } from './components/FontPicker'
import './styles/page.css'

export interface InkPageProps {
  pageSize?: PageSize
  theme?: Theme
  className?: string
  style?: CSSProperties
  /** Remove the default wrap padding/min-height — use when embedding InkPage in your own layout */
  bare?: boolean
}

export function InkPage({ pageSize = 'A4', theme = 'parchment', className, style, bare = false }: InkPageProps) {
  const { editor, ruled, font, colors } = useInkEditor()

  const widthPx = getPageWidthPx(pageSize)
  const bodyWidthPx = getBodyWidthPx(pageSize)
  const dims = PAGE_DIMENSIONS[pageSize]
  const pageHeightPx = Math.round(dims.heightMm * 3.7795)
  const bodyHeightPx = getBodyHeightPx(pageSize)

  const cssVars = {
    '--ink-bg': colors.canvasBg,
    '--ink-page': colors.paperColor,
    '--ink-text': colors.textColor,
    '--ink-border-line': colors.lineColor,
    '--ink-accent': colors.accentColor,
    '--ink-font-body': FONTS[font].family,
  } as CSSProperties

  return (
    <div className={bare ? 'ink-page-wrap ink-page-wrap--single' : 'ink-page-wrap'} data-theme={theme} style={cssVars}>
      <div
        className={`ink-page-card${ruled ? ' ink-ruled' : ''}${className ? ` ${className}` : ''}`}
        style={{
          width: widthPx,
          minHeight: pageHeightPx,
          padding: `${dims.paddingTopMm}mm ${dims.paddingRightMm}mm ${dims.paddingBottomMm}mm ${dims.paddingLeftMm}mm`,
          ['--ink-padding-top' as string]: `${dims.paddingTopMm}mm`,
          ['--ink-padding-right' as string]: `${dims.paddingRightMm}mm`,
          ['--ink-padding-left' as string]: `${dims.paddingLeftMm}mm`,
          ['--ink-body-width' as string]: `${bodyWidthPx}px`,
          ['--ink-body-height' as string]: `${bodyHeightPx}px`,
          ...style,
        }}
      >
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}

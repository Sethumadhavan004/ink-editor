import { EditorContent } from '@tiptap/react'
import type { Editor } from '@tiptap/react'
import type { PageSize, Theme, ToolbarKey } from '../types'
import { getPageWidthPx, getBodyWidthPx, getBodyHeightPx, PAGE_DIMENSIONS } from '../types'
import { Toolbar } from './Toolbar'

interface Props {
  editor: Editor
  pageSize: PageSize
  theme: Theme
  toolbar: ToolbarKey[]
  ruled: boolean
  onToggleRuled: () => void
  isActive: boolean
}

export function SinglePage({ editor, pageSize, theme, toolbar, ruled, onToggleRuled, isActive }: Props) {
  const widthPx = getPageWidthPx(pageSize)
  const bodyWidthPx = getBodyWidthPx(pageSize)
  const bodyHeightPx = getBodyHeightPx(pageSize)
  const dims = PAGE_DIMENSIONS[pageSize]
  const paddingCss = `${dims.paddingTopMm}mm ${dims.paddingRightMm}mm ${dims.paddingBottomMm}mm ${dims.paddingLeftMm}mm`

  return (
    <div
      className={`ink-page-card${ruled ? ' ink-ruled' : ''}`}
      data-theme={theme}
      style={{
        width: widthPx,
        height: Math.round(dims.heightMm * 3.7795),
        padding: paddingCss,
        boxSizing: 'border-box',
        ['--ink-padding-top' as string]: `${dims.paddingTopMm}mm`,
        ['--ink-padding-right' as string]: `${dims.paddingRightMm}mm`,
        ['--ink-padding-left' as string]: `${dims.paddingLeftMm}mm`,
        ['--ink-body-width' as string]: `${bodyWidthPx}px`,
        ['--ink-body-height' as string]: `${bodyHeightPx}px`,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {isActive && toolbar.length > 0 && (
        <Toolbar
          editor={editor}
          buttons={toolbar}
          ruled={ruled}
          onToggleRuled={onToggleRuled}
        />
      )}
      <EditorContent editor={editor} />
    </div>
  )
}

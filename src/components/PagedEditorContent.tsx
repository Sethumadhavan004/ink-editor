import { EditorContent } from '@tiptap/react'
import type { Editor } from '@tiptap/react'
import { getPageWidthPx, getBodyWidthPx, getBodyHeightPx, PAGE_DIMENSIONS } from '../types'
import type { PageSize, Theme, ToolbarKey } from '../types'
import { Toolbar } from './Toolbar'
import '../styles/page.css'

interface Props {
  editor: Editor | null
  pageSize: PageSize
  theme: Theme
  toolbar: ToolbarKey[]
  ruled: boolean
  onToggleRuled: () => void
}

export function PagedEditorContent({ editor, pageSize, theme, toolbar, ruled, onToggleRuled }: Props) {
  const widthPx = getPageWidthPx(pageSize)
  const bodyWidthPx = getBodyWidthPx(pageSize)
  const dims = PAGE_DIMENSIONS[pageSize]
  const pageHeightPx = Math.round(dims.heightMm * 3.7795)
  const paddingCss = `${dims.paddingTopMm}mm ${dims.paddingRightMm}mm ${dims.paddingBottomMm}mm ${dims.paddingLeftMm}mm`
  const hasToolbar = toolbar.length > 0
  const bodyHeightPx = getBodyHeightPx(pageSize)

  return (
    <div className="ink-page-wrap" data-theme={theme}>
      <div
        className={`ink-page-card${ruled ? ' ink-ruled' : ''}`}
        style={{
          width: widthPx,
          minHeight: pageHeightPx,
          padding: paddingCss,
          ['--ink-padding-top' as string]: `${dims.paddingTopMm}mm`,
          ['--ink-padding-right' as string]: `${dims.paddingRightMm}mm`,
          ['--ink-padding-left' as string]: `${dims.paddingLeftMm}mm`,
          ['--ink-body-width' as string]: `${bodyWidthPx}px`,
          ['--ink-body-height' as string]: `${bodyHeightPx}px`,
        }}
      >
        {editor && hasToolbar && (
          <Toolbar
            editor={editor}
            buttons={toolbar}
            ruled={ruled}
            onToggleRuled={onToggleRuled}
          />
        )}
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}

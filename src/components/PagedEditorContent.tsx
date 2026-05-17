import { EditorContent } from '@tiptap/react'
import type { Editor } from '@tiptap/react'
import { getBodyHeightPx, getPageWidthPx, PAGE_DIMENSIONS } from '../types'
import type { PageSize } from '../types'
import '../styles/page.css'

interface Props {
  editor: Editor | null
  pageSize: PageSize
}

export function PagedEditorContent({ editor, pageSize }: Props) {
  const bodyHeightPx = getBodyHeightPx(pageSize)
  const widthPx = getPageWidthPx(pageSize)
  const dims = PAGE_DIMENSIONS[pageSize]

  const paddingTopPx = Math.round(dims.paddingTopMm * 3.7795)
  const paddingBottomPx = Math.round(dims.paddingBottomMm * 3.7795)
  const pageHeightPx = Math.round(dims.heightMm * 3.7795)
  const paddingCss = `${dims.paddingTopMm}mm ${dims.paddingRightMm}mm ${dims.paddingBottomMm}mm ${dims.paddingLeftMm}mm`

  // Draw a grey band at every page boundary via repeating-linear-gradient.
  // Band sits between end-of-body and start-of-next-body (the inter-page gap).
  const bandStart = paddingTopPx + bodyHeightPx
  const bandEnd = bandStart + paddingBottomPx + paddingTopPx

  const pageBreakBackground = [
    `repeating-linear-gradient(`,
    `  to bottom,`,
    `  transparent 0px,`,
    `  transparent ${bandStart - 1}px,`,
    `  #c0c0c0 ${bandStart - 1}px,`,
    `  #c0c0c0 ${bandEnd}px,`,
    `  transparent ${bandEnd}px,`,
    `  transparent ${pageHeightPx}px`,
    `)`,
  ].join('\n')

  return (
    <div className="ink-page-wrap">
      <div
        className="ink-page-card"
        style={{
          width: widthPx,
          padding: paddingCss,
          backgroundImage: pageBreakBackground,
          backgroundSize: `100% ${pageHeightPx}px`,
          backgroundRepeat: 'repeat-y',
        }}
      >
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}

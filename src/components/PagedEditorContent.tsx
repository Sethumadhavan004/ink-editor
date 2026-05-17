import { useEffect, useRef, useState } from 'react'
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
  const pageHeightPx = Math.round(dims.heightMm * 3.7795)
  const paddingCss = `${dims.paddingTopMm}mm ${dims.paddingRightMm}mm ${dims.paddingBottomMm}mm ${dims.paddingLeftMm}mm`

  const [pageCount, setPageCount] = useState(1)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!editor) return

    const measure = () => {
      const el = contentRef.current?.querySelector('.ProseMirror') as HTMLElement | null
      if (!el) return
      const pages = Math.max(1, Math.ceil(el.scrollHeight / bodyHeightPx))
      setPageCount(pages)
    }

    editor.on('update', measure)
    const t = setTimeout(measure, 50)
    return () => {
      editor.off('update', measure)
      clearTimeout(t)
    }
  }, [editor, bodyHeightPx])

  // Draw a horizontal rule at each page boundary using repeating-linear-gradient.
  // The rule appears at multiples of bodyHeightPx within the padded content area.
  // We use the body height (not full page height) as repeat interval since padding
  // is part of the card and text flows through it continuously.
  const pageBreakBackground = `repeating-linear-gradient(
    to bottom,
    transparent 0px,
    transparent ${bodyHeightPx - 1}px,
    #d0d0d0 ${bodyHeightPx - 1}px,
    #d0d0d0 ${bodyHeightPx}px
  )`

  return (
    <div className="ink-page-wrap">
      <div
        ref={contentRef}
        className="ink-page-card"
        style={{
          width: widthPx,
          minHeight: pageHeightPx,
          padding: paddingCss,
          backgroundImage: pageBreakBackground,
          backgroundSize: `100% ${bodyHeightPx}px`,
          backgroundRepeat: 'repeat-y',
          backgroundPositionY: `${Math.round(dims.paddingTopMm * 3.7795)}px`,
        }}
      >
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}

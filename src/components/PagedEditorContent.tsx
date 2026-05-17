import { useEffect, useRef, useState } from 'react'
import { EditorContent } from '@tiptap/react'
import type { Editor } from '@tiptap/react'
import { getBodyHeightPx, getPageWidthPx, PAGE_DIMENSIONS } from '../types'
import type { PageSize } from '../types'
import '../styles/page.css'

const PAGE_GAP_PX = 24

interface Props {
  editor: Editor | null
  pageSize: PageSize
}

export function PagedEditorContent({ editor, pageSize }: Props) {
  const bodyHeightPx = getBodyHeightPx(pageSize)
  const widthPx = getPageWidthPx(pageSize)
  const dims = PAGE_DIMENSIONS[pageSize]
  const pageHeightPx = Math.round(dims.heightMm * 3.7795)

  const paddingTopPx = Math.round(dims.paddingTopMm * 3.7795)
  const paddingLeftPx = Math.round(dims.paddingLeftMm * 3.7795)
  const paddingRightPx = Math.round(dims.paddingRightMm * 3.7795)

  const [pageCount, setPageCount] = useState(1)
  const contentRef = useRef<HTMLDivElement>(null)

  // Measure content height after every editor update and compute page count
  useEffect(() => {
    if (!editor) return

    const measure = () => {
      const el = contentRef.current?.querySelector('.ProseMirror') as HTMLElement | null
      if (!el) return
      const contentHeight = el.scrollHeight
      const pages = Math.max(1, Math.ceil(contentHeight / bodyHeightPx))
      setPageCount(pages)
    }

    editor.on('update', measure)
    // Small delay on mount to let DOM paint first
    const t = setTimeout(measure, 50)

    return () => {
      editor.off('update', measure)
      clearTimeout(t)
    }
  }, [editor, bodyHeightPx])

  // Total height of all page cards stacked with gaps between them
  const totalPagesHeight = pageCount * pageHeightPx + (pageCount - 1) * PAGE_GAP_PX

  return (
    <div className="ink-page-wrap">
      {/* Page card backgrounds — purely decorative, stacked white cards */}
      <div className="ink-pages-stack" style={{ width: widthPx, position: 'relative', height: totalPagesHeight }}>
        {Array.from({ length: pageCount }).map((_, i) => (
          <div
            key={i}
            className="ink-page-card"
            style={{
              position: 'absolute',
              top: i * (pageHeightPx + PAGE_GAP_PX),
              left: 0,
              width: widthPx,
              height: pageHeightPx,
            }}
          />
        ))}

        {/* The single contenteditable floats over all page cards */}
        <div
          ref={contentRef}
          style={{
            position: 'absolute',
            top: paddingTopPx,
            left: paddingLeftPx,
            right: paddingRightPx,
            width: widthPx - paddingLeftPx - paddingRightPx,
          }}
        >
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  )
}

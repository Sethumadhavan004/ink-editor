import { useEffect, useRef, useState } from 'react'
import { EditorContent } from '@tiptap/react'
import type { Editor } from '@tiptap/react'
import { getBodyHeightPx, getPageWidthPx, PAGE_DIMENSIONS } from '../types'
import type { PageSize, Theme, ToolbarKey } from '../types'
import { Toolbar } from './Toolbar'
import '../styles/page.css'

interface Props {
  editor: Editor | null
  pageSize: PageSize
  theme: Theme
  toolbar: ToolbarKey[]
}

export function PagedEditorContent({ editor, pageSize, theme, toolbar }: Props) {
  const bodyHeightPx = getBodyHeightPx(pageSize)
  const widthPx = getPageWidthPx(pageSize)
  const dims = PAGE_DIMENSIONS[pageSize]
  const pageHeightPx = Math.round(dims.heightMm * 3.7795)
  const paddingTopPx = Math.round(dims.paddingTopMm * 3.7795)
  const paddingCss = `${dims.paddingTopMm}mm ${dims.paddingRightMm}mm ${dims.paddingBottomMm}mm ${dims.paddingLeftMm}mm`
  const firstLinePx = paddingTopPx + bodyHeightPx

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

  const pageBreakBackground = `repeating-linear-gradient(
    to bottom,
    transparent 0px,
    transparent ${firstLinePx - 1}px,
    var(--ink-border-line, #d0d0d0) ${firstLinePx - 1}px,
    var(--ink-border-line, #d0d0d0) ${firstLinePx}px,
    transparent ${firstLinePx}px,
    transparent ${pageHeightPx}px
  )`

  return (
    <div className="ink-page-wrap" data-theme={theme}>
      <div
        ref={contentRef}
        className="ink-page-card"
        style={{
          width: widthPx,
          minHeight: pageHeightPx,
          padding: paddingCss,
          backgroundImage: pageBreakBackground,
          backgroundSize: `100% ${pageHeightPx}px`,
          backgroundRepeat: 'repeat-y',
          ['--ink-padding-top' as string]: `${dims.paddingTopMm}mm`,
          ['--ink-padding-right' as string]: `${dims.paddingRightMm}mm`,
          ['--ink-padding-left' as string]: `${dims.paddingLeftMm}mm`,
        }}
      >
        {editor && toolbar.length > 0 && (
          <Toolbar editor={editor} buttons={toolbar} />
        )}
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}

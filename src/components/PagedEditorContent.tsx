import { useEffect, useRef, useCallback } from 'react'
import { EditorContent } from '@tiptap/react'
import { Decoration, DecorationSet } from '@tiptap/pm/view'
import type { Editor } from '@tiptap/react'
import { getBodyHeightPx, getPageWidthPx, PAGE_DIMENSIONS } from '../types'
import type { PageSize } from '../types'
import { pageLayoutKey } from '../extensions/PageLayout'
import '../styles/page.css'

interface Props {
  editor: Editor | null
  pageSize: PageSize
}

export function PagedEditorContent({ editor, pageSize }: Props) {
  const rafRef = useRef<number | null>(null)

  const bodyHeightPx = getBodyHeightPx(pageSize)
  const widthPx = getPageWidthPx(pageSize)
  const dims = PAGE_DIMENSIONS[pageSize]
  const paddingCss = `${dims.paddingTopMm}mm ${dims.paddingRightMm}mm ${dims.paddingBottomMm}mm ${dims.paddingLeftMm}mm`

  const measureAndInject = useCallback(() => {
    if (!editor) return

    const doc = editor.state.doc
    const decorations: Decoration[] = []
    let cumulativeHeight = 0
    let pageIndex = 0

    doc.forEach((node, offset) => {
      const domNode = editor.view.nodeDOM(offset) as HTMLElement | null
      if (!domNode) return

      const nodeHeight = domNode.getBoundingClientRect().height
      const pageBodyHeight = bodyHeightPx * (pageIndex + 1)

      if (cumulativeHeight + nodeHeight > pageBodyHeight - 2) {
        decorations.push(
          Decoration.widget(
            offset,
            () => {
              const hr = document.createElement('hr')
              hr.className = 'ink-page-break'
              return hr
            },
            { side: -1, key: `page-break-${pageIndex}` }
          )
        )
        pageIndex++
      }

      cumulativeHeight += nodeHeight
    })

    const decoSet = DecorationSet.create(doc, decorations)
    const tr = editor.state.tr.setMeta(pageLayoutKey, decoSet)
    editor.view.dispatch(tr)
  }, [editor, bodyHeightPx])

  useEffect(() => {
    if (!editor) return

    const schedule = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(measureAndInject)
    }

    editor.on('update', schedule)
    // Run once after mount so initial content gets page breaks
    schedule()

    return () => {
      editor.off('update', schedule)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [editor, measureAndInject])

  return (
    <div className="ink-page-wrap">
      <div
        className="ink-page-card"
        style={{ width: widthPx, minHeight: bodyHeightPx, padding: paddingCss }}
      >
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}

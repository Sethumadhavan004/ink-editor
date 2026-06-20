import { useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import { useState, useRef } from 'react'
import { TabIndent } from './extensions/TabIndent'
import { PageStack } from './components/PageStack'
import { getBodyHeightPx } from './types'
import type { PageSize, Theme, ToolbarKey } from './types'
import type { Editor } from '@tiptap/react'
import type { JSONContent } from '@tiptap/core'
import './styles/page.css'

const DEFAULT_TOOLBAR: ToolbarKey[] = ['bold', 'italic', 'underline', 'h1', 'h2', 'align', 'list', 'indent', 'lines']

export interface InkEditorProps {
  pageSize?: PageSize
  onChange?: (pages: JSONContent[]) => void
  theme?: Theme
  toolbar?: ToolbarKey[]
}

function makeExtensions(pageSize: PageSize) {
  return [
    StarterKit,
    TextAlign.configure({ types: ['heading', 'paragraph'] }),
    Underline,
    TabIndent,
  ]
}

export function InkEditor({
  pageSize = 'A4',
  onChange,
  theme = 'parchment',
  toolbar = DEFAULT_TOOLBAR,
}: InkEditorProps) {
  const [activePage, setActivePage] = useState(0)
  const [ruled, setRuled] = useState(false)
  const [pageCount, setPageCount] = useState(1)
  const overflowingRef = useRef(false)
  const bodyHeightPx = getBodyHeightPx(pageSize)

  // Fixed hooks — one per slot. Cannot use loops with hooks.
  const e0 = useEditor({ extensions: makeExtensions(pageSize), onUpdate() { handleUpdate(0) } })
  const e1 = useEditor({ extensions: makeExtensions(pageSize), onUpdate() { handleUpdate(1) } })
  const e2 = useEditor({ extensions: makeExtensions(pageSize), onUpdate() { handleUpdate(2) } })
  const e3 = useEditor({ extensions: makeExtensions(pageSize), onUpdate() { handleUpdate(3) } })
  const e4 = useEditor({ extensions: makeExtensions(pageSize), onUpdate() { handleUpdate(4) } })
  const e5 = useEditor({ extensions: makeExtensions(pageSize), onUpdate() { handleUpdate(5) } })
  const e6 = useEditor({ extensions: makeExtensions(pageSize), onUpdate() { handleUpdate(6) } })
  const e7 = useEditor({ extensions: makeExtensions(pageSize), onUpdate() { handleUpdate(7) } })
  const e8 = useEditor({ extensions: makeExtensions(pageSize), onUpdate() { handleUpdate(8) } })
  const e9 = useEditor({ extensions: makeExtensions(pageSize), onUpdate() { handleUpdate(9) } })

  const allEditors: (Editor | null)[] = [e0, e1, e2, e3, e4, e5, e6, e7, e8, e9]

  function fireOnChange() {
    if (!onChange) return
    const jsons = allEditors
      .slice(0, pageCount)
      .filter((e): e is Editor => e !== null && !e.isDestroyed)
      .map(e => e.getJSON())
    onChange(jsons)
  }

  function handleUpdate(index: number) {
    if (index >= pageCount) return
    fireOnChange()
    checkOverflow(index)
  }

  function checkOverflow(index: number) {
    if (overflowingRef.current) return
    const editor = allEditors[index]
    if (!editor || editor.isDestroyed) return
    const dom = editor.view.dom as HTMLElement
    if (dom.scrollHeight <= bodyHeightPx) return

    overflowingRef.current = true

    const doc = editor.state.doc
    let lastBlockPos = 0
    doc.forEach((_node, offset) => { lastBlockPos = offset })
    const lastNode = doc.nodeAt(lastBlockPos)
    if (!lastNode) { overflowingRef.current = false; return }

    const overflowJson = lastNode.toJSON() as JSONContent

    const tr = editor.state.tr
      .delete(lastBlockPos, lastBlockPos + lastNode.nodeSize)
      .setMeta('addToHistory', false)
    editor.view.dispatch(tr)

    const nextIndex = index + 1
    setPageCount(prev => Math.max(prev, nextIndex + 1))

    setTimeout(() => {
      const next = allEditors[nextIndex]
      if (next && !next.isDestroyed) {
        const existing = next.getJSON().content ?? []
        next.commands.setContent({ type: 'doc', content: [overflowJson, ...existing] })
        setActivePage(nextIndex)
      }
      overflowingRef.current = false
    }, 0)
  }

  const activeEditors = allEditors
    .slice(0, pageCount)
    .filter((e): e is Editor => e !== null)

  if (activeEditors.length === 0) return null

  return (
    <PageStack
      editors={activeEditors}
      activePage={Math.min(activePage, activeEditors.length - 1)}
      pageSize={pageSize}
      theme={theme}
      toolbar={toolbar}
      ruled={ruled}
      onToggleRuled={() => setRuled(r => !r)}
      onPageClick={setActivePage}
    />
  )
}

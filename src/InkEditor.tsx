import { useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import { useEffect, useState } from 'react'
import { PageLayout } from './extensions/PageLayout'
import { TabIndent } from './extensions/TabIndent'
import { PagedEditorContent } from './components/PagedEditorContent'
import type { PageSize, Theme, ToolbarKey } from './types'

const DEFAULT_TOOLBAR: ToolbarKey[] = ['bold', 'italic', 'underline', 'h1', 'h2', 'align', 'list', 'indent', 'lines']

export interface InkEditorProps {
  pageSize?: PageSize
  onChange?: (json: object) => void
  theme?: Theme
  toolbar?: ToolbarKey[]
}

export function InkEditor({
  pageSize = 'A4',
  onChange,
  theme = 'parchment',
  toolbar = DEFAULT_TOOLBAR,
}: InkEditorProps) {
  const [ruled, setRuled] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit,
      PageLayout.configure({ pageSize }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Underline,
      TabIndent,
    ],
    onUpdate({ editor }) {
      onChange?.(editor.getJSON())
    },
  })

  useEffect(() => {
    return () => {
      editor?.destroy()
    }
  }, [editor])

  return (
    <PagedEditorContent
      editor={editor}
      pageSize={pageSize}
      theme={theme}
      toolbar={toolbar}
      ruled={ruled}
      onToggleRuled={() => setRuled((r) => !r)}
    />
  )
}

import { useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import { useEffect } from 'react'
import { PageLayout } from './extensions/PageLayout'
import { PagedEditorContent } from './components/PagedEditorContent'
import type { PageSize, Theme, ToolbarKey } from './types'

const DEFAULT_TOOLBAR: ToolbarKey[] = ['bold', 'italic', 'underline', 'h1', 'h2', 'align', 'list', 'indent']

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
  const editor = useEditor({
    extensions: [
      StarterKit,
      PageLayout.configure({ pageSize }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Underline,
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
    />
  )
}

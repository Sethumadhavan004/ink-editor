import { useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useEffect } from 'react'
import { PageLayout } from './extensions/PageLayout'
import { PagedEditorContent } from './components/PagedEditorContent'
import type { PageSize } from './types'

export interface InkEditorProps {
  pageSize?: PageSize
  onChange?: (json: object) => void
}

export function InkEditor({ pageSize = 'A4', onChange }: InkEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      PageLayout.configure({ pageSize }),
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

  return <PagedEditorContent editor={editor} pageSize={pageSize} />
}

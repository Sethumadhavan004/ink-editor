import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useEffect } from 'react'

export interface InkEditorProps {
  onChange?: (json: object) => void
}

export function InkEditor({ onChange }: InkEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],

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
    <div className="ink-editor" style={{ border: '1px solid #ccc', minHeight: '200px', padding: '8px' }}>
      <EditorContent editor={editor} />
    </div>
  )
}

import { useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import { useState, useEffect, useCallback, type ReactNode } from 'react'
import { PageLayout } from './extensions/PageLayout'
import { TabIndent } from './extensions/TabIndent'
import { SinglePageOverflow } from './extensions/SinglePageOverflow'
import { InkEditorContext, type InkEditorState } from './context'
import type { PageSize, Theme, FontKey, ThemeColors } from './types'
import { PARCHMENT_DEFAULTS, MINIMAL_DEFAULTS } from './types'

export interface InkEditorRootProps {
  pageSize?: PageSize
  theme?: Theme
  initialFont?: FontKey
  initialColors?: Partial<ThemeColors>
  singlePage?: boolean
  onOverflow?: (fitsJson: object, overflowJson: object) => void
  onPageBreak?: (pageCount: number) => void
  initialContent?: object
  onChange?: (json: object) => void
  onColorsChange?: (colors: ThemeColors) => void
  children: ReactNode
}

export function InkEditorRoot({
  pageSize = 'A4',
  theme = 'parchment',
  initialFont = 'cursive',
  initialColors,
  singlePage = false,
  onOverflow,
  onPageBreak,
  initialContent,
  onChange,
  onColorsChange,
  children,
}: InkEditorRootProps) {
  const [ruled, setRuled] = useState(false)
  const [font, setFont] = useState<FontKey>(initialFont)
  const [colors, setColors] = useState<ThemeColors>({
    ...(theme === 'minimal' ? MINIMAL_DEFAULTS : PARCHMENT_DEFAULTS),
    ...initialColors,
  })
  const [pageCount, setPageCount] = useState(1)

  const extensions = [
    StarterKit,
    TextAlign.configure({ types: ['heading', 'paragraph'] }),
    Underline,
    TabIndent,
    ...(singlePage
      ? [SinglePageOverflow.configure({ pageSize, onOverflow: onOverflow ?? (() => {}) })]
      : [PageLayout.configure({ pageSize })]
    ),
  ]

  const editor = useEditor({
    extensions,
    content: initialContent as never ?? undefined,
    onUpdate({ editor }) {
      onChange?.(editor.getJSON())
    },
  })

  // Count gap widgets to track page count, fire onPageBreak
  useEffect(() => {
    if (!editor) return
    const dom = editor.view.dom as HTMLElement

    function countPages() {
      const gaps = dom.querySelectorAll('.ink-page-gap').length
      const count = gaps + 1
      setPageCount(count)
      onPageBreak?.(count)
    }

    const observer = new MutationObserver(countPages)
    observer.observe(dom, { childList: true, subtree: true })
    countPages()

    return () => observer.disconnect()
  }, [editor, onPageBreak])

  useEffect(() => {
    return () => { editor?.destroy() }
  }, [editor])

  const addPage = useCallback(() => {
    if (!editor) return
    const end = editor.state.doc.content.size - 1
    editor.chain().focus().insertContentAt(end, [{ type: 'paragraph' }, { type: 'paragraph' }]).run()
  }, [editor])

  const deletePage = useCallback((_index: number) => {
    console.warn('ink-editor: deletePage is not yet implemented')
  }, [])

  const handleSetColors = useCallback((c: ThemeColors) => {
    setColors(c)
    onColorsChange?.(c)
  }, [onColorsChange])

  const value: InkEditorState = {
    editor,
    pageCount,
    ruled,
    font,
    colors,
    setRuled,
    setFont,
    setColors: handleSetColors,
    addPage,
    deletePage,
  }

  return (
    <InkEditorContext.Provider value={value}>
      {children}
    </InkEditorContext.Provider>
  )
}

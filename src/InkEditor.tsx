import { useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import { useEffect, useState, type ReactNode } from 'react'
import { PageLayout } from './extensions/PageLayout'
import { TabIndent } from './extensions/TabIndent'
import { SinglePageOverflow } from './extensions/SinglePageOverflow'
import { PagedEditorContent } from './components/PagedEditorContent'
import type { PageSize, Theme, ToolbarKey, FontKey, ThemeColors } from './types'
import { PARCHMENT_DEFAULTS, MINIMAL_DEFAULTS } from './types'

const DEFAULT_TOOLBAR: ToolbarKey[] = ['bold', 'italic', 'underline', 'h1', 'h2', 'align', 'list', 'indent', 'lines']

export interface InkEditorProps {
  pageSize?: PageSize
  onChange?: (json: object) => void
  theme?: Theme
  toolbar?: ToolbarKey[]
  initialFont?: FontKey
  initialColors?: Partial<ThemeColors>
  toolbarStart?: ReactNode[]
  toolbarEnd?: ReactNode[]
  /** Single-page mode: disables multi-page gap widgets. Use with onOverflow. */
  singlePage?: boolean
  /** Called when content overflows one page. fitsJson = content that fits, overflowJson = spilled content. */
  onOverflow?: (fitsJson: object, overflowJson: object) => void
  /** Seed content (Tiptap JSON doc) — used to pre-fill a page, e.g. overflow from previous page. */
  initialContent?: object
  /** Called whenever the user changes colors via the color panel. */
  onColorsChange?: (colors: ThemeColors) => void
  /** Color panel keys to hide — e.g. ['canvasBg'] when the host controls the background. */
  hiddenColorKeys?: (keyof ThemeColors)[]
}

export function InkEditor({
  pageSize = 'A4',
  onChange,
  theme = 'parchment',
  toolbar = DEFAULT_TOOLBAR,
  initialFont = 'cursive',
  initialColors,
  toolbarStart,
  toolbarEnd,
  singlePage = false,
  onOverflow,
  initialContent,
  onColorsChange,
  hiddenColorKeys,
}: InkEditorProps) {
  const [ruled, setRuled] = useState(false)
  const [font, setFont] = useState<FontKey>(initialFont)
  const [colors, setColors] = useState<ThemeColors>({
    ...(theme === 'minimal' ? MINIMAL_DEFAULTS : PARCHMENT_DEFAULTS),
    ...initialColors,
  })

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
      font={font}
      onFontChange={setFont}
      colors={colors}
      onColorsChange={(c) => { setColors(c); onColorsChange?.(c) }}
      toolbarStart={toolbarStart}
      toolbarEnd={toolbarEnd}
      singlePage={singlePage}
      hiddenColorKeys={hiddenColorKeys}
    />
  )
}

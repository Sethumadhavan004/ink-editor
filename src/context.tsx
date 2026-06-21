import { createContext, useContext } from 'react'
import type { Editor } from '@tiptap/react'
import type { FontKey, ThemeColors } from './types'

export interface InkEditorState {
  editor: Editor | null
  pageCount: number
  ruled: boolean
  font: FontKey
  colors: ThemeColors
  setRuled: (v: boolean) => void
  setFont: (f: FontKey) => void
  setColors: (c: ThemeColors) => void
  addPage: () => void
  deletePage: (index: number) => void
}

export const InkEditorContext = createContext<InkEditorState | null>(null)

export function useInkEditor(): InkEditorState {
  const ctx = useContext(InkEditorContext)
  if (!ctx) throw new Error('useInkEditor must be used inside <InkEditorRoot>')
  return ctx
}

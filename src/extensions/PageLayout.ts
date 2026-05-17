import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { DecorationSet } from '@tiptap/pm/view'
import type { PageSize } from '../types'

export const pageLayoutKey = new PluginKey<DecorationSet>('pageLayout')

export const PageLayout = Extension.create<{ pageSize: PageSize }>({
  name: 'pageLayout',

  addOptions() {
    return { pageSize: 'A4' }
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: pageLayoutKey,
        state: {
          init() {
            return DecorationSet.empty
          },
          apply(tr, old) {
            // Decoration set is updated externally via tr.setMeta from PagedEditorContent.
            // On non-meta transactions just remap existing decorations to new positions.
            const next = tr.getMeta(pageLayoutKey)
            if (next) return next
            return old.map(tr.mapping, tr.doc)
          },
        },
        props: {
          decorations(state) {
            return pageLayoutKey.getState(state)
          },
        },
      }),
    ]
  },
})

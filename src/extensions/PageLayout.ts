import { Extension } from '@tiptap/core'
import type { PageSize } from '../types'

// Placeholder for future v2 structural page enforcement.
// v1 page boundaries are rendered via CSS in PagedEditorContent.
export const PageLayout = Extension.create<{ pageSize: PageSize }>({
  name: 'pageLayout',

  addOptions() {
    return { pageSize: 'A4' }
  },
})

import { Extension } from '@tiptap/core'

export const TabIndent = Extension.create({
  name: 'tabIndent',
  addKeyboardShortcuts() {
    return {
      Tab: () => this.editor.commands.insertContent('    '),
    }
  },
})

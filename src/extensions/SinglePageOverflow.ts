import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import type { EditorView } from '@tiptap/pm/view'
import type { Node as ProseMirrorNode } from '@tiptap/pm/model'
import type { PageSize } from '../types'
import { PAGE_DIMENSIONS } from '../types'

const pluginKey = new PluginKey('singlePageOverflow')

function getBodyHeightPx(view: EditorView, pageSize: PageSize): number {
  const card = (view.dom as HTMLElement).closest('.ink-page-card') as HTMLElement | null
  if (card) {
    const style = window.getComputedStyle(card)
    const paddingTop = parseFloat(style.paddingTop)
    const paddingBottom = parseFloat(style.paddingBottom)
    const totalHeight = card.offsetHeight || 0
    // Use measured card height minus padding, snapped to line grid
    const bodyPx = totalHeight - paddingTop - paddingBottom
    if (bodyPx > 0) return Math.floor(bodyPx / 28) * 28
  }
  // Fallback: compute from mm
  const d = PAGE_DIMENSIONS[pageSize]
  const PX_PER_MM = 3.7795
  return Math.floor(((d.heightMm - d.paddingTopMm - d.paddingBottomMm) * PX_PER_MM) / 28) * 28
}

function splitAtOverflow(
  doc: ProseMirrorNode,
  view: EditorView,
  bodyHeightPx: number,
): { fitsJson: object; overflowJson: object } | null {
  // Walk top-level blocks, measure their bottom relative to doc top
  let baseY: number | null = null
  let splitPos: number | null = null

  doc.forEach((node, offset) => {
    if (splitPos !== null) return
    const pos = offset + 1 // inside the node
    if (pos >= doc.content.size) return
    let bottom: number
    try {
      const coords = view.coordsAtPos(pos)
      if (baseY === null) baseY = coords.top
      const endPos = offset + node.nodeSize - 1
      bottom = endPos > pos ? view.coordsAtPos(endPos).bottom : coords.bottom
    } catch {
      return
    }
    const relBottom = bottom - (baseY ?? bottom)
    if (relBottom > bodyHeightPx) {
      splitPos = offset // this block is the first one that overflows
    }
  })

  if (splitPos === null) return null // nothing overflows

  // Slice doc into fits / overflow
  const schema = doc.type.schema
  const fitsContent = doc.slice(0, splitPos).content
  const overflowContent = doc.slice(splitPos).content

  const fitsJson = schema.nodeFromJSON({ type: 'doc', content: fitsContent.toJSON() ?? [] }).toJSON()
  const overflowJson = schema.nodeFromJSON({ type: 'doc', content: overflowContent.toJSON() ?? [] }).toJSON()

  return { fitsJson, overflowJson }
}

export interface SinglePageOverflowOptions {
  pageSize: PageSize
  onOverflow: (fitsJson: object, overflowJson: object) => void
}

export const SinglePageOverflow = Extension.create<SinglePageOverflowOptions>({
  name: 'singlePageOverflow',

  addOptions() {
    return {
      pageSize: 'A4',
      onOverflow: () => {},
    }
  },

  addProseMirrorPlugins() {
    const { pageSize, onOverflow } = this.options
    let rafId: ReturnType<typeof requestAnimationFrame> | null = null

    function scheduleCheck(view: EditorView) {
      if (rafId !== null) cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(() => {
        rafId = null
        if (view.isDestroyed) return
        const bodyHeightPx = getBodyHeightPx(view, pageSize)
        const result = splitAtOverflow(view.state.doc, view, bodyHeightPx)
        if (!result) return

        const { fitsJson, overflowJson } = result

        // Trim the editor to just the fitting content
        const schema = view.state.schema
        const fitsDoc = schema.nodeFromJSON(fitsJson)
        const tr = view.state.tr.replaceWith(0, view.state.doc.content.size, fitsDoc.content)
        tr.setMeta('addToHistory', false)
        tr.setMeta('singlePageTrim', true)
        view.dispatch(tr)

        onOverflow(fitsJson, overflowJson)
      })
    }

    return [
      new Plugin({
        key: pluginKey,
        view(editorView) {
          return {
            update(view, prevState) {
              // Only check on real doc changes, skip our own trim dispatches
              if (
                view.state.doc.eq(prevState.doc) ||
                view.state.tr?.getMeta?.('singlePageTrim')
              ) return
              if (view.state.doc.content.size !== prevState.doc.content.size ||
                  !view.state.doc.eq(prevState.doc)) {
                scheduleCheck(view)
              }
            },
            destroy() {
              if (rafId !== null) cancelAnimationFrame(rafId)
            },
          }
        },
      }),
    ]
  },
})

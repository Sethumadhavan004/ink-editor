import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet, EditorView } from '@tiptap/pm/view'
import { Node as ProseMirrorNode } from '@tiptap/pm/model'
import type { PageSize } from '../types'
import { PAGE_DIMENSIONS } from '../types'

const META_KEY = 'pageBreakDecos'
const pluginKey = new PluginKey<DecorationSet>('pageBreak')

function makeGapWidget(gapHeightPx: number, pageIndex: number): HTMLElement {
  const el = document.createElement('div')
  el.className = 'ink-page-gap'
  el.setAttribute('data-page-gap', String(pageIndex))
  el.style.height = `${gapHeightPx}px`
  el.contentEditable = 'false'
  return el
}

function computeDecorations(
  doc: ProseMirrorNode,
  view: EditorView,
  bodyHeightPx: number,
  gapHeightPx: number,
): DecorationSet {
  const decorations: Decoration[] = []
  let pageIndex = 1
  let baseY: number | null = null

  doc.descendants((node, pos) => {
    if (!node.isBlock) return

    const insidePos = pos + 1
    if (insidePos >= doc.content.size) return

    let top: number
    let bottom: number
    try {
      top = view.coordsAtPos(insidePos).top
      // coordsAtPos at end of node gives the bottom of the last line
      const endPos = pos + node.nodeSize - 1
      bottom = endPos > insidePos ? view.coordsAtPos(endPos).bottom : top + 28
    } catch {
      return
    }

    if (baseY === null) baseY = top

    const threshold = pageIndex * bodyHeightPx + (pageIndex - 1) * gapHeightPx

    // Fire on top of this node OR when the previous node's bottom crossed the threshold
    const relTop = top - baseY
    const relBottom = bottom - baseY

    if (relTop >= threshold || (relBottom > threshold && relTop < threshold)) {
      const idx = pageIndex
      decorations.push(
        Decoration.widget(pos, () => makeGapWidget(gapHeightPx, idx), {
          side: -1,
          key: `page-gap-${idx}`,
        }),
      )
      pageIndex++
    }
  })

  return DecorationSet.create(doc, decorations)
}

function measurePageDimensions(view: EditorView, pageSize: PageSize): { bodyHeightPx: number; gapHeightPx: number } | null {
  const card = (view.dom as HTMLElement).closest('.ink-page-card') as HTMLElement | null
  if (!card) return null

  // getComputedStyle converts mm→px using the real browser DPR — more accurate than 3.7795
  const style = window.getComputedStyle(card)
  const paddingTop = parseFloat(style.paddingTop)
  const paddingBottom = parseFloat(style.paddingBottom)
  const gapHeightPx = Math.round(paddingTop + paddingBottom)

  // Use the page's mm ratio to derive body height from the measured gap
  const dims = PAGE_DIMENSIONS[pageSize]
  const bodyMm = dims.heightMm - dims.paddingTopMm - dims.paddingBottomMm
  const gapMm = dims.paddingTopMm + dims.paddingBottomMm

  const pmPaddingTop = parseFloat(window.getComputedStyle(view.dom as HTMLElement).paddingTop) || 28
  // Widget height: raw gap minus pmPaddingTop (follows each gap naturally), snapped to 28-grid
  // No margin-top on the widget CSS, so no extra offset to account for
  const rawWidgetHeight = gapHeightPx - pmPaddingTop
  const widgetHeightPx = Math.round(rawWidgetHeight / 28) * 28
  // No toolbar subtraction needed — coordsAtPos sets baseY from the first line,
  // so relY is already relative to content start, not the card top.
  const rawBodyHeight = Math.round((bodyMm / gapMm) * gapHeightPx)
  const bodyHeightPx = Math.floor(rawBodyHeight / 28) * 28

  return { bodyHeightPx, gapHeightPx: widgetHeightPx }
}

export function buildPageBreakPlugin(pageSize: PageSize): Plugin<DecorationSet> {
  let rafId: ReturnType<typeof requestAnimationFrame> | null = null

  function scheduleUpdate(view: EditorView) {
    if (rafId !== null) cancelAnimationFrame(rafId)
    rafId = requestAnimationFrame(() => {
      rafId = null
      if (view.isDestroyed) return
      const dims = measurePageDimensions(view, pageSize)
      if (!dims) return
      const { bodyHeightPx, gapHeightPx } = dims
      const decos = computeDecorations(view.state.doc, view, bodyHeightPx, gapHeightPx)
      const tr = view.state.tr.setMeta(META_KEY, decos)
      // Mark as not adding to history
      tr.setMeta('addToHistory', false)
      view.dispatch(tr)
    })
  }

  return new Plugin<DecorationSet>({
    key: pluginKey,

    state: {
      init() {
        return DecorationSet.empty
      },
      apply(tr, old) {
        // When our rAF dispatch arrives, install the new decorations
        const meta = tr.getMeta(META_KEY) as DecorationSet | undefined
        if (meta) return meta
        // For doc changes, map existing decorations to keep positions valid
        if (tr.docChanged) return old.map(tr.mapping, tr.doc)
        return old
      },
    },

    props: {
      decorations(state) {
        return pluginKey.getState(state) ?? DecorationSet.empty
      },
    },

    view(editorView) {
      // First paint
      scheduleUpdate(editorView)

      return {
        update(view, prevState) {
          // Only recompute when document content changed
          if (!view.state.doc.eq(prevState.doc)) {
            scheduleUpdate(view)
          }
        },
        destroy() {
          if (rafId !== null) cancelAnimationFrame(rafId)
        },
      }
    },
  })
}

export const PageLayout = Extension.create<{ pageSize: PageSize }>({
  name: 'pageLayout',

  addOptions() {
    return { pageSize: 'A4' }
  },

  addProseMirrorPlugins() {
    return [buildPageBreakPlugin(this.options.pageSize)]
  },
})

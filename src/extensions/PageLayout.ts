import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet, EditorView } from '@tiptap/pm/view'
import { Node as ProseMirrorNode } from '@tiptap/pm/model'
import { PAGE_DIMENSIONS, getBodyHeightPx } from '../types'
import type { PageSize } from '../types'

const META_KEY = 'pageBreakDecos'
const pluginKey = new PluginKey<DecorationSet>('pageBreak')

function makeGapWidget(gapHeightPx: number, pageIndex: number): HTMLElement {
  const el = document.createElement('div')
  el.className = 'ink-page-gap'
  el.setAttribute('data-page-gap', String(pageIndex))
  el.style.height = `${gapHeightPx}px`
  el.style.marginBottom = '28px'
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
    try {
      top = view.coordsAtPos(insidePos).top
    } catch {
      return
    }

    if (baseY === null) baseY = top

    const relY = top - baseY
    const threshold = pageIndex * bodyHeightPx + (pageIndex - 1) * gapHeightPx

    if (relY >= threshold) {
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

export function buildPageBreakPlugin(pageSize: PageSize): Plugin<DecorationSet> {
  const dims = PAGE_DIMENSIONS[pageSize]
  const PX_PER_MM = 3.7795
  const bodyHeightPx = getBodyHeightPx(pageSize)
  const paddingTopPx = Math.round(dims.paddingTopMm * PX_PER_MM)
  const paddingBottomPx = Math.round(dims.paddingBottomMm * PX_PER_MM)
  const gapHeightPx = paddingBottomPx + paddingTopPx

  let rafId: ReturnType<typeof requestAnimationFrame> | null = null

  function scheduleUpdate(view: EditorView) {
    if (rafId !== null) cancelAnimationFrame(rafId)
    rafId = requestAnimationFrame(() => {
      rafId = null
      if (view.isDestroyed) return
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

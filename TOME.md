# ink-editor — Note to Future Claude

**Read this before touching any code. This picks up where the last session left off.**

---

## What Was Built This Session

Phase 1 (scaffold) and Phase 2 (page layout engine) are both partially complete. Here is the exact state.

### Phase 1 — DONE ✓

- npm workspace monorepo: root is the library, `demo/` is a Next.js 15 app
- tsup builds ESM + CJS + `.d.ts` to `dist/`
- `src/InkEditor.tsx` — bare Tiptap editor with `StarterKit`, accepts `pageSize` and `onChange` props
- `src/index.ts` — exports `InkEditor`, `InkEditorProps`, `PageSize`
- `demo/app/InkEditorClient.tsx` — `'use client'` wrapper with `dynamic(..., { ssr: false })` — this is the correct Next.js App Router pattern, do not change it
- `demo/app/page.tsx` — server component, imports `InkEditorClient`

### Phase 2 — IN PROGRESS ⚠️

Built but has one remaining bug:

- `src/types.ts` — `PageSize`, `PAGE_DIMENSIONS`, `getBodyHeightPx()`, `getPageWidthPx()` — correct, do not touch
- `src/extensions/PageLayout.ts` — stub only, no logic (v1 uses CSS, not ProseMirror decorators)
- `src/styles/page.css` — page wrap, card, ProseMirror reset styles
- `src/components/PagedEditorContent.tsx` — **this is where the bug is**

---

## The Bug to Fix First

**Symptom:** The page break line appears too early — roughly 1-2 lines before the body height is actually full. There is visible white space below the line before content continues.

**Root cause:** `backgroundPositionY` offset interaction with `backgroundSize`. The current code sets:

```css
backgroundSize: `100% ${bodyHeightPx}px`
backgroundPositionY: `${paddingTopPx}px`
```

The gradient repeats every `bodyHeightPx`, but is offset by `paddingTopPx`. This means the first line draws at `paddingTopPx + bodyHeightPx` from the card top, but `bodyHeightPx` already excludes padding — so the math double-counts. The line should fire exactly at the point where content would overflow a real A4 page.

**The fix:** The gradient should repeat at the full page height (`pageHeightPx`), not the body height, with the first line drawn at `paddingTopPx + bodyHeightPx` (i.e. at the bottom of the first page's content area). Like this:

```
transparent 0px → transparent (paddingTopPx + bodyHeightPx - 1)px  [content area]
grey at (paddingTopPx + bodyHeightPx - 1)px → grey at (paddingTopPx + bodyHeightPx)px  [1px line]
transparent continues to pageHeightPx  [bottom padding + next page top padding]
repeat every pageHeightPx
```

No `backgroundPositionY` needed — the first stripe naturally lands at the right place.

**Key numbers (A4):**
- `pageHeightPx` = `Math.round(297 * 3.7795)` = 1122px
- `paddingTopPx` = `Math.round(22 * 3.7795)` = 83px
- `bodyHeightPx` = `Math.round((297 - 44) * 3.7795)` = 955px
- First line at: `83 + 955` = 1038px from card top
- Repeat every: 1122px

---

## Current File State

```
ink-editor/
├── package.json          # workspace root + library, exports include ./dist/index.css
├── tsconfig.json
├── tsup.config.ts
├── src/
│   ├── index.ts
│   ├── InkEditor.tsx
│   ├── types.ts
│   ├── extensions/
│   │   └── PageLayout.ts   # stub, no logic
│   ├── components/
│   │   └── PagedEditorContent.tsx   # HAS THE BUG
│   └── styles/
│       └── page.css
└── demo/
    ├── package.json        # depends on "ink-editor": "file:../"
    └── app/
        ├── layout.tsx
        ├── page.tsx
        └── InkEditorClient.tsx   # 'use client' + dynamic ssr:false
```

---

## What Phase 2 Looks Like When Done

- White A4 card on grey background on load (correct full page height, not collapsed)
- As user types past the body area, a thin grey horizontal line appears exactly at the page boundary
- Text continues below the line on the same card (single contenteditable, no gap)
- The line is purely decorative — text flows through it
- No typing in gaps, no stacked card approach

This is v1. Structural page enforcement (separate ProseMirror instances per page) is explicitly v2.

---

## What Comes After (Phase 3+)

See `HANDOFF.md` for the full build order. After Phase 2 is confirmed working:

- **Phase 3:** Toolbar (Bold, Italic, Underline, text alignment, font size, line spacing, indent)
- **Phase 4:** Theming (`default` and `parchment` themes via CSS variables)
- **Phase 5:** PDF export via `@react-pdf/renderer` — reference `D:\projects\everything-unsaid\src\lib\pdf.ts`
- **Phase 6:** Polish + npm publish

---

## Key Things Learned This Session (Don't Re-Learn These)

1. **SSR pattern for Next.js App Router:** `ssr: false` must be in a `'use client'` component — cannot be in a server component. The wrapper file pattern (`InkEditorClient.tsx`) is correct.

2. **Tiptap SSR:** `useEditor` requires `immediatelyRender: false` OR the component must be dynamically imported with `ssr: false`. We use the dynamic import approach — `immediatelyRender` was removed from `InkEditor.tsx`.

3. **CSS export:** tsup extracts CSS into `dist/index.css`. The demo imports it as `import 'ink-editor/dist/index.css'`. The `package.json` exports field must include `"./dist/index.css": "./dist/index.css"` for Next.js to resolve it.

4. **Workspace linking:** Root package (`ink-editor`) is symlinked at `node_modules/ink-editor` → the repo root. The demo resolves it from there. `"ink-editor": "file:../"` in `demo/package.json` is what creates this.

5. **Stacked card + floating contenteditable doesn't work for v1:** Text flows into the gaps between cards. Single growing card with CSS boundary lines is the correct v1 approach.

---

## How to Run

```bash
# Build the library
cd D:\projects\ink-editor
npm run build

# Run the demo
cd D:\projects\ink-editor\demo
npm run dev
# open http://localhost:3000
```

---

## Plans

- Phase 1 plan: `docs/superpowers/plans/2026-05-16-phase1-scaffold.md`
- Phase 2 plan: `docs/superpowers/plans/2026-05-17-phase2-page-layout.md`

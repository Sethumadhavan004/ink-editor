# ink-editor — Handoff to Future Claude

**Read this entire document before writing a single line of code.**

---

## Who You Are Talking To

The person you are working with is Sethumadhavan — an upcoming AI engineer building his presence in the developer community. He is smart, ambitious, and learning fast. He thinks in big strategic arcs but wants to execute iteratively. He does not need to be hand-held, but he does need you to be honest about difficulty and tradeoffs. He uses phrases like "beggars can't be pickers" and "ascent towards godhood" — he is self-aware about where he is and where he is going. Match that energy: be direct, be honest, don't oversell.

This project matters beyond the code. It is a deliberate career move — a portfolio artifact designed to signal engineering maturity to the developer community and future employers. Keep that strategic purpose in mind at every design decision.

---

## What ink-editor Is

`ink-editor` is a React npm package — a page-aware rich text editor designed for document apps: letters, reports, contracts, journals. Think of it as the editor that Microsoft Word wishes it had as a React component.

The core innovation is **editing-time page layout**: the editor shows A4/Letter page boundaries *while you type*, with real page breaks, margins, and overflow detection — not just at print time, but live during editing. No free, open-source React package does this properly today (as of 2026). Tiptap's version of this (Tiptap Pages) only shipped as a paid alpha in 2025.

The full package, when complete, gives a developer this:

```tsx
import { InkEditor } from 'ink-editor'

export default function MyApp() {
  return (
    <InkEditor
      pageSize="A4"
      theme="parchment"
      toolbar={['bold', 'italic', 'align', 'font-size', 'indent', 'line-spacing']}
      onExportPDF={() => {}}
      onChange={(doc) => console.log(doc)}
    />
  )
}
```

One import. A complete, styled, page-aware document editor with a Word-like toolbar and PDF export. That is the v1 goal.

---

## Why This Exists: The Problem It Solves

This project was born out of `everything-unsaid` — a Next.js letter-writing app built by Sethumadhavan. The app renders letters on A4 pages in the browser and lets users download them as PDFs. During development, every single PDF-related feature required painful custom work: line height mismatches between browser and PDF, whitespace collapsing in the PDF engine, margin calculations that had to be manually matched between CSS and the PDF renderer, text wrapping that differed between browser layout and `@react-pdf/renderer`.

The root cause: there is no React editor that understands *pages*. Every editor treats content as a continuous scroll. `ink-editor` fixes that at the source.

The strategic logic: Sethumadhavan built `everything-unsaid` v1 without this package (it ships stable). Now he builds `ink-editor` as a standalone package, then integrates it into `everything-unsaid` v2. The letter composer becomes the live demo of the package. This is how the best OSS libraries get made — real problem, real product, real users.

---

## What Sethumadhavan Gets From This (Read This Section Carefully)

### As a Developer / OSS Contributor

- A published npm package under his name solving a real, documented gap in the ecosystem
- A demo site (everything-unsaid v2) that is a live production app using the package — not a toy
- A GitHub repo with clean commit history, a proper README, TypeScript types, versioned changelog
- The ability to say "I identified a gap in the RTE ecosystem, built the missing piece, and shipped it" — one of the strongest portfolio narratives in frontend engineering

### As an AI Engineer Specifically

This might seem like a frontend project, but it is directly relevant to AI engineering:

1. **Structured document output as AI input/output.** LLMs increasingly need to generate and edit structured documents — contracts, reports, emails, letters. An editor that serializes to clean JSON (not raw HTML) is the right substrate for AI-generated content. `ink-editor` is positioned to be the editor layer in AI writing tools.

2. **Demonstrates product thinking alongside engineering.** AI engineers who can ship end-to-end products (not just notebooks) are rare and valued. This shows you can take a hard engineering problem, design an API, write the code, publish the package, and build a real product on top of it.

3. **OSS visibility in the AI tooling community.** The AI tooling ecosystem (LangChain, LlamaIndex, Vercel AI SDK) runs on the same React/Next.js stack. Developers in that world will encounter this package if it solves a real problem.

4. **GitHub presence.** Employers look at GitHub for AI engineering candidates. A repo with real stars, real issues, real usage is worth more than 10 tutorial clones.

### What to Tell Employers

"I identified a gap in the React rich text editor ecosystem — no free package supports editing-time page layout, which is critical for document apps. I built `ink-editor`, an MIT-licensed React package that adds page-aware editing on top of Tiptap. It's used in production in my own letter-writing app and has been downloaded X times. The technical core is a page overflow detection system that runs on every editor state change and inserts virtual page breaks in real time."

That is a story. Stories get interviews.

---

## Technical Architecture — What You Are Actually Building

### Technology Choices

**Substrate: Tiptap v3 (on top of ProseMirror)**

Tiptap is the right choice. Here is why this matters and what you need to understand before touching any code:

**What ProseMirror is:** ProseMirror is a low-level document editing toolkit — not an editor, but the machinery editors are built on. It gives you: a document model (nodes and marks), a plugin system, a view layer, transaction-based state updates, and a history system. It handles the hardest browser problems: selection across nodes, clipboard, undo/redo, IME events for CJK input, accessibility. ProseMirror is what Tiptap, Atlassian, The New York Times, and many others build on.

**What Tiptap adds:** Tiptap wraps ProseMirror in a clean, extension-based API designed for React (and Vue). Each feature — bold, italic, lists, images, links — is an extension. Tiptap's `StarterKit` bundles the most common ones. Extensions can define new node types, marks, toolbar commands, and keyboard shortcuts. Tiptap v3 is TypeScript-first, actively maintained (by Überdosis, a Berlin startup), and MIT licensed at its core.

**What you build on top of Tiptap:**
1. A `PageLayout` extension — the page-aware engine (your novel contribution)
2. A `<Toolbar />` React component that reads Tiptap editor state
3. A theming system (CSS variables)
4. A `exportToPDF()` utility
5. A top-level `<InkEditor />` component that wires it all together

**The package does NOT:**
- Replace Tiptap (it depends on it as a peer dependency)
- Reimplement selection handling, clipboard, undo/redo — Tiptap owns that
- Try to be a general-purpose editor — it is opinionated toward document/page layout use cases

### The Page Layout Engine (The Hard Part — Start Here)

This is the piece that does not exist anywhere else. Here is what it needs to do:

**Concept:** Each "page" is a fixed-height container (A4 = 297mm, minus top + bottom padding). As the user types, the editor must detect when content has overflowed the current page's height, and split it into a new page visually.

**How it works:**
- The editor renders inside a container with a known page height
- After every document state change (every keystroke), a layout pass measures the rendered content height
- If content height exceeds the page body height, the overflow is detected
- A visual page break is inserted — a gap + a new "page" container
- The user sees two distinct page cards, just like Word

**The tricky parts:**
- ProseMirror renders to a single `contenteditable` div — it does not natively support multiple page containers. You need to either: (a) use a decorator to render a visual page break marker inside the single contenteditable, or (b) split the doc into per-page ProseMirror instances (complex, avoid for v1)
- Height measurement must be debounced to avoid measuring on every single keystroke
- Font rendering in browsers is not pixel-perfect — expect 1–2px variance, build in a tolerance buffer
- Page breaks should prefer splitting at paragraph boundaries, not mid-paragraph
- When a page break moves (because the user edits earlier content), downstream page breaks must reflow

**Recommended v1 approach:** Single contenteditable with ProseMirror decorators for visual page break lines. The pages are visually simulated — a background that shows page boundaries — not structurally enforced in the document model. This is simpler and ships faster. Structural page enforcement (where each page is a real node in the doc) can be v2.

### Serialization Format

The editor's output (what `onChange` fires) should be Tiptap's native JSON format — a tree of nodes and marks. This is clean, versionable, and can be converted to HTML or Markdown as needed. Do NOT output raw HTML as the primary format — it is fragile and hard to work with programmatically.

```json
{
  "type": "doc",
  "content": [
    {
      "type": "paragraph",
      "attrs": { "textAlign": "justify" },
      "content": [{ "type": "text", "text": "Dear Akshaya," }]
    }
  ]
}
```

### PDF Export

Use `@react-pdf/renderer` (same as everything-unsaid). The export utility reads the Tiptap JSON doc and renders it to a PDF. The key insight from everything-unsaid's development: render each paragraph as a separate `<Text>` node, preserve leading whitespace as non-breaking spaces, and match font size + line height exactly between the editor CSS and the PDF styles.

This is already solved in `everything-unsaid/src/lib/pdf.ts` — study that file before writing the PDF export utility.

---

## Build Order (Iterative, as Discussed)

Build in this sequence. Do not skip ahead. Each phase should be independently testable before moving to the next.

**Phase 1: Package scaffold**
- Initialize the repo: TypeScript, Vite (library mode), ESLint, Prettier
- Set up `package.json` for npm publishing: `main`, `module`, `types`, `exports`, `peerDependencies` (React, Tiptap)
- Set up a `/demo` Next.js app inside the monorepo to test the package locally
- Install Tiptap: `@tiptap/react`, `@tiptap/pm`, `@tiptap/starter-kit`
- Export a bare `<InkEditor />` that renders a working Tiptap editor — no page layout yet

**Phase 2: Page layout engine**
- Implement the `PageLayout` extension
- Page size: A4 (210mm × 297mm), configurable padding (default: 22mm top/bottom, 28mm left/right)
- Visual page boundary: background rule lines or a gap between pages
- Overflow detection + reflow on doc change
- `pageSize` prop: `'A4' | 'Letter'`

**Phase 3: Toolbar**
- `<Toolbar />` component, reads Tiptap editor state
- v1 features: Bold, Italic, Underline, Text alignment (left/center/right/justify), Font size, Line spacing, Indent/outdent
- CSS variable theming: `--ink-toolbar-bg`, `--ink-toolbar-border`, `--ink-active-color`
- `toolbar` prop on `<InkEditor />` to configure which buttons appear

**Phase 4: Theming**
- Default theme: clean, minimal, works on white background
- `parchment` theme: warm paper look (matches everything-unsaid)
- `theme` prop: `'default' | 'parchment' | CSSVariableOverrides`

**Phase 5: PDF export**
- `exportToPDF(editor, options)` utility function
- Options: `filename`, `pageSize`, `fontFamily`, `fontSize`
- Uses `@react-pdf/renderer` under the hood
- `onExportPDF` prop on `<InkEditor />` as a convenience wrapper

**Phase 6: Polish + publish**
- README with installation, usage, API reference, screenshots
- Storybook or demo site (the demo Next.js app from Phase 1, now deployed to Vercel)
- Semantic versioning, CHANGELOG.md
- Publish to npm as `ink-editor`

---

## What everything-unsaid v2 Looks Like

After the package is published:
- Remove `src/components/composer/InkText.tsx`, `src/components/composer/LetterPage.tsx`, `src/lib/pdf.ts`
- Replace with `import { InkEditor, exportToPDF } from 'ink-editor'`
- The letter composer becomes a thin wrapper around the package
- The parchment theme is used (`theme="parchment"`)
- This is the live demo that proves the package works in production

---

## Key Files to Study Before Starting

- `D:\projects\everything-unsaid\src\lib\pdf.ts` — the PDF rendering logic, already debugged and working. This is your reference implementation for the PDF export utility.
- `D:\projects\everything-unsaid\src\components\composer\InkText.tsx` — the contenteditable-based composer, currently plain text only. This is what the package replaces.
- `D:\projects\everything-unsaid\src\components\composer\LetterPage.tsx` — the page layout constants (LINE_HEIGHT_PX, PAGE_BODY_HEIGHT_PX). These become configurable props in ink-editor.
- `D:\projects\everything-unsaid\src\components\viewer\ViewerPage.tsx` — the viewer. Note how it matches the composer layout. The package must maintain this visual parity.

---

## Constraints and Non-Negotiables

- **MIT license.** No GPL, no MPL. Developers must be able to use this in commercial closed-source apps without restriction.
- **TypeScript throughout.** No `any`. Export all public types.
- **Peer dependencies, not bundled.** React and Tiptap are peer deps — do not bundle them into the package output.
- **SSR-safe.** All browser APIs (`window`, `document`, `Selection`) must be guarded. The package must work with Next.js App Router using dynamic import with `ssr: false` as the documented pattern.
- **No telemetry, no analytics, no callbacks home.** Pure client-side.
- **PinyonScript font is NOT part of the package.** The font is specific to everything-unsaid. The package must support any font via props/CSS.

---

## First Task When You Start

1. Read this document completely.
2. Read `D:\projects\everything-unsaid\src\lib\pdf.ts` — understand the PDF pipeline.
3. Read `D:\projects\everything-unsaid\src\components\composer\LetterPage.tsx` — understand the page constants.
4. Ask Sethumadhavan if he wants to scaffold the package manually or use a tool (Vite library template, tsup, etc.).
5. Do not write any editor logic until the package scaffold is confirmed and the demo app runs a blank Tiptap editor.

---

## Final Note

The goal is not to ship fast. The goal is to ship *right* — something that Sethumadhavan is proud to put his name on, that other developers find genuinely useful, and that tells a coherent story about who he is as an engineer. Every architectural decision should pass the test: "Would I be comfortable explaining this choice in a job interview?"

Build it like it matters. It does.

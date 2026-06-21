# ink-editor

A page-aware rich text editor for React. Shows real A4/Letter page boundaries as you type — not at print time, but live, while editing.

```tsx
import { InkEditor } from '@sethumadhavan004/ink-editor'
import '@sethumadhavan004/ink-editor/dist/index.css'

<InkEditor pageSize="A4" theme="parchment" onChange={(doc) => save(doc)} />
```

---

## Why this exists

Every React rich text editor treats content as an infinite scroll. That's fine for most things — but if you're building a document editor (letters, contracts, reports, journals), you need to know where the pages break while you're editing, not just when you hit "export to PDF."

That mismatch is why PDF exports from browser editors almost always look slightly wrong: line heights are off, margins don't match, text wraps differently. The root cause is that the editor has no concept of pages.

`ink-editor` fixes that at the source. Page layout is part of the editor, not bolted on afterwards.

---

## Features

- **Live page boundaries** — A4 and Letter page sizes, with real margins, rendered as you type
- **Floating toolbar** — bold, italic, underline, headings, alignment, lists, indent, ruled lines
- **Font picker** — cursive, serif, sans-serif, slab, monospace (all via Google Fonts)
- **Color customization** — canvas, paper, text, lines, and accent colors with swatch presets and a custom color picker
- **Two themes** — `parchment` (warm, document-like) and `minimal` (clean, white)
- **Toolbar slots** — `toolbarStart` and `toolbarEnd` props to inject your own buttons into the toolbar
- **Single-page mode** — renders one fixed-height page with an `onOverflow` callback; lets you build multi-page apps where each page is a separate editor instance
- **Serializes to JSON** — `onChange` gives you Tiptap's native JSON doc tree, not raw HTML
- **SSR-safe** — works with Next.js App Router via dynamic import
- **TypeScript throughout** — all props and types exported

---

## Installation

```bash
npm install @sethumadhavan004/ink-editor
```

Peer dependencies — install these if you don't have them:

```bash
npm install react react-dom @tiptap/react @tiptap/pm @tiptap/starter-kit @tiptap/extension-text-align @tiptap/extension-underline
```

---

## Usage

### Basic

```tsx
import { InkEditor } from '@sethumadhavan004/ink-editor'
import '@sethumadhavan004/ink-editor/dist/index.css'

export default function App() {
  return (
    <InkEditor
      pageSize="A4"
      theme="parchment"
      onChange={(doc) => console.log(doc)}
    />
  )
}
```

### With Next.js (App Router)

Dynamic import is required — the editor uses browser APIs that can't run on the server.

```tsx
// components/EditorClient.tsx
'use client'
import dynamic from 'next/dynamic'
import '@sethumadhavan004/ink-editor/dist/index.css'

const InkEditor = dynamic(
  () => import('@sethumadhavan004/ink-editor').then((m) => m.InkEditor),
  { ssr: false }
)

export function EditorClient() {
  return <InkEditor pageSize="A4" onChange={(doc) => console.log(doc)} />
}
```

### Custom toolbar

Pass an array of keys to show only the buttons you want:

```tsx
<InkEditor
  toolbar={['bold', 'italic', 'underline', 'align', 'list']}
/>
```

Available keys: `bold` `italic` `underline` `h1` `h2` `align` `list` `indent` `lines` `addpage`

### Toolbar slots

Inject your own buttons at the start or end of the toolbar:

```tsx
<InkEditor
  toolbarStart={[
    <button onClick={handleSave}>Save</button>
  ]}
  toolbarEnd={[
    <button onClick={handleExport}>Export PDF</button>
  ]}
/>
```

### Custom colors and fonts

```tsx
import { PARCHMENT_DEFAULTS } from '@sethumadhavan004/ink-editor'

<InkEditor
  initialFont="serif"
  initialColors={{ ...PARCHMENT_DEFAULTS, paperColor: '#fffde7' }}
  onColorsChange={(colors) => savePreference(colors)}
/>
```

### Single-page mode

Useful for building paginated editors where each page is a separate component:

```tsx
<InkEditor
  singlePage
  initialContent={pageContent}
  onOverflow={(fitsJson, overflowJson) => {
    // fitsJson = content that fit on this page
    // overflowJson = content that spilled — seed the next page with this
    setNextPageContent(overflowJson)
  }}
/>
```

### Pre-loading content

```tsx
const savedDoc = { type: 'doc', content: [...] } // Tiptap JSON

<InkEditor initialContent={savedDoc} />
```

---

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `pageSize` | `'A4' \| 'Letter'` | `'A4'` | Page dimensions |
| `theme` | `'parchment' \| 'minimal'` | `'parchment'` | Visual theme |
| `toolbar` | `ToolbarKey[]` | all buttons | Which toolbar buttons to show |
| `initialFont` | `FontKey` | `'cursive'` | Starting font |
| `initialColors` | `Partial<ThemeColors>` | theme defaults | Override individual color values |
| `onChange` | `(json: object) => void` | — | Fires on every edit with the Tiptap JSON doc |
| `onColorsChange` | `(colors: ThemeColors) => void` | — | Fires when user changes colors |
| `toolbarStart` | `ReactNode[]` | — | Elements to prepend to the toolbar |
| `toolbarEnd` | `ReactNode[]` | — | Elements to append to the toolbar |
| `singlePage` | `boolean` | `false` | Fix height to one page; hides page gap widgets |
| `onOverflow` | `(fitsJson, overflowJson) => void` | — | Called when content exceeds one page (requires `singlePage`) |
| `initialContent` | `object` | — | Tiptap JSON doc to pre-load |
| `hiddenColorKeys` | `(keyof ThemeColors)[]` | — | Color panel rows to hide |

---

## How the page layout engine works

The core is a ProseMirror plugin (`PageLayout`) that runs after every document change. It uses `coordsAtPos()` to measure where each block-level node actually renders in the browser, then inserts gap widgets (via ProseMirror decorations) at the positions where content crosses a page boundary. The gap is sized so the visual break lands exactly at the bottom of one page and the top of the next.

The page height and margins are derived from real CSS — `getComputedStyle` on the page card element — rather than hardcoded pixel values. This keeps the layout correct regardless of browser zoom or DPI.

Ruled lines are a CSS repeating gradient locked to a 28px line grid, which matches the editor's paragraph `line-height`. They toggle via a class on the page card.

---

## Built on

- **[Tiptap](https://tiptap.dev/)** — the extension framework sitting on top of ProseMirror. Handles all the hard editor problems: selection, clipboard, undo/redo, keyboard shortcuts, IME. MIT licensed.
- **[ProseMirror](https://prosemirror.net/)** — the underlying document model and plugin system. The page layout engine is a ProseMirror plugin using `Decoration` widgets and `coordsAtPos`.
- **[lucide-react](https://lucide.dev/)** — toolbar icons.
- **[Google Fonts](https://fonts.google.com/)** — Dancing Script, Inter, Roboto Slab, JetBrains Mono for the font picker.

### Design acknowledgements

The visual direction of `ink-editor` — the warm parchment tones, the floating pill toolbar, the paper-on-canvas feel — was shaped in part by studying [tw93](https://github.com/tw93)'s work on [Kami](https://github.com/tw93/kami) and his broader aesthetic sensibility. If you've seen his projects, you'll recognize the vibe. His open design work was a real reference point and it shows. Worth a follow.

---

## Local development

```bash
git clone https://github.com/Sethumadhavan004/ink-editor
cd ink-editor
npm install

# Build the library
npm run build

# Run the demo app
cd demo
npm run dev
# open http://localhost:3000
```

---

## License

MIT — use it in personal or commercial projects, no strings attached.

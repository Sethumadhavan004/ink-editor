'use client'

import dynamic from 'next/dynamic'
import 'ink-editor/dist/index.css'

const InkEditor = dynamic(() => import('ink-editor').then(m => m.InkEditor), { ssr: false })
const ComposableDemo = dynamic(() => import('./ComposableDemo'), { ssr: false })

export function InkEditorClient() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 48, padding: 32 }}>
      <section>
        <h2 style={{ fontFamily: 'sans-serif', fontSize: 14, marginBottom: 12, opacity: 0.5, margin: '0 0 12px' }}>
          Batteries-included (unchanged API)
        </h2>
        <InkEditor
          pageSize="A4"
          theme="parchment"
          toolbar={['bold', 'italic', 'underline', 'h1', 'h2', 'align', 'list', 'indent', 'lines']}
          onChange={(json: object) => console.log('batteries-included:', json)}
        />
      </section>

      <section>
        <h2 style={{ fontFamily: 'sans-serif', fontSize: 14, marginBottom: 12, opacity: 0.5, margin: '0 0 12px' }}>
          Composable API — toolbar detached, placed by consumer
        </h2>
        <ComposableDemo />
      </section>
    </div>
  )
}

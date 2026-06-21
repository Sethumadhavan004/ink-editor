'use client'

import { InkEditorRoot, InkPage, InkToolbar } from 'ink-editor'

export default function ComposableDemo() {
  return (
    <InkEditorRoot
      pageSize="A4"
      theme="parchment"
      onChange={(json) => console.log('composable:', json)}
      onPageBreak={(count) => console.log('page count:', count)}
    >
      {/* Toolbar is outside the page — consumer controls placement entirely */}
      <div style={{ position: 'sticky', top: 0, zIndex: 100, marginBottom: 16 }}>
        <InkToolbar
          buttons={['bold', 'italic', 'underline', 'h1', 'h2', 'align', 'list', 'indent', 'lines']}
        />
      </div>

      {/* Page canvas — standalone, no toolbar inside */}
      <div style={{ background: '#e0ddd4', padding: '32px 0', display: 'flex', justifyContent: 'center' }}>
        <InkPage pageSize="A4" theme="parchment" />
      </div>
    </InkEditorRoot>
  )
}

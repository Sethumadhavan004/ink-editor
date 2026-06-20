'use client'

import dynamic from 'next/dynamic'
import 'ink-editor/dist/index.css'

const InkEditor = dynamic(() => import('ink-editor').then((m) => m.InkEditor), { ssr: false })

export function InkEditorClient() {
  return (
    <InkEditor
      pageSize="A4"
      theme="parchment"
      toolbar={['bold', 'italic', 'underline', 'h1', 'h2', 'align', 'list', 'indent', 'lines']}
      onChange={(json: object) => console.log(json)}
    />
  )
}

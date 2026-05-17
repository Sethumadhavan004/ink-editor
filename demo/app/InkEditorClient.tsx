'use client'

import dynamic from 'next/dynamic'
import 'ink-editor/dist/index.css'

const InkEditor = dynamic(() => import('ink-editor').then((m) => m.InkEditor), { ssr: false })

export function InkEditorClient() {
  return <InkEditor onChange={(json: object) => console.log(json)} />
}

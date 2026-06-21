// Composable primitives
export { InkEditorRoot } from './InkEditorRoot'
export type { InkEditorRootProps } from './InkEditorRoot'
export { InkPage } from './InkPage'
export type { InkPageProps } from './InkPage'
export { InkToolbar } from './InkToolbar'
export type { InkToolbarProps } from './InkToolbar'
export { useInkEditor } from './context'
export type { InkEditorState } from './context'

// Batteries-included wrapper — no breaking changes
export { InkEditor } from './InkEditor'
export type { InkEditorProps } from './InkEditor'

// Shared types
export type { PageSize, Theme, ToolbarKey, FontKey, ThemeColors } from './types'
export { PARCHMENT_DEFAULTS, MINIMAL_DEFAULTS } from './types'

// Advanced extension export
export { SinglePageOverflow } from './extensions/SinglePageOverflow'

import { type ReactNode } from 'react'
import { InkEditorRoot } from './InkEditorRoot'
import { InkPage } from './InkPage'
import { InkToolbar } from './InkToolbar'
import type { PageSize, Theme, ToolbarKey, FontKey, ThemeColors } from './types'

const DEFAULT_TOOLBAR: ToolbarKey[] = [
  'bold', 'italic', 'underline', 'h1', 'h2', 'align', 'list', 'indent', 'lines',
]

export interface InkEditorProps {
  pageSize?: PageSize
  onChange?: (json: object) => void
  theme?: Theme
  toolbar?: ToolbarKey[]
  initialFont?: FontKey
  initialColors?: Partial<ThemeColors>
  toolbarStart?: ReactNode[]
  toolbarEnd?: ReactNode[]
  singlePage?: boolean
  onOverflow?: (fitsJson: object, overflowJson: object) => void
  initialContent?: object
  onColorsChange?: (colors: ThemeColors) => void
  hiddenColorKeys?: (keyof ThemeColors)[]
}

export function InkEditor({
  pageSize = 'A4',
  onChange,
  theme = 'parchment',
  toolbar = DEFAULT_TOOLBAR,
  initialFont = 'cursive',
  initialColors,
  toolbarStart,
  toolbarEnd,
  singlePage = false,
  onOverflow,
  initialContent,
  onColorsChange,
  hiddenColorKeys,
}: InkEditorProps) {
  const hasToolbar = toolbar.length > 0

  return (
    <InkEditorRoot
      pageSize={pageSize}
      theme={theme}
      initialFont={initialFont}
      initialColors={initialColors}
      singlePage={singlePage}
      onOverflow={onOverflow}
      initialContent={initialContent}
      onChange={onChange}
      onColorsChange={onColorsChange}
    >
      <div className={singlePage ? undefined : 'ink-page-wrap'} data-theme={theme}>
        {hasToolbar && (
          <div className="ink-floating-toolbar-wrap">
            <InkToolbar
              buttons={toolbar}
              toolbarStart={toolbarStart}
              toolbarEnd={toolbarEnd}
              hiddenColorKeys={hiddenColorKeys}
            />
          </div>
        )}
        <InkPage pageSize={pageSize} theme={theme} />
      </div>
    </InkEditorRoot>
  )
}

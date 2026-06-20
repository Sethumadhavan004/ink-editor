import { motion } from 'framer-motion'
import type { Editor } from '@tiptap/react'
import type { PageSize, Theme, ToolbarKey } from '../types'
import { getPageWidthPx, PAGE_DIMENSIONS } from '../types'
import { SinglePage } from './SinglePage'

const SPRING = { type: 'spring' as const, stiffness: 55, damping: 22 }

interface Props {
  editors: Editor[]
  activePage: number
  pageSize: PageSize
  theme: Theme
  toolbar: ToolbarKey[]
  ruled: boolean
  onToggleRuled: () => void
  onPageClick: (index: number) => void
}

export function PageStack({
  editors, activePage, pageSize, theme, toolbar, ruled, onToggleRuled, onPageClick,
}: Props) {
  const widthPx = getPageWidthPx(pageSize)
  const dims = PAGE_DIMENSIONS[pageSize]
  const heightPx = Math.round(dims.heightMm * 3.7795)

  return (
    <div className="ink-page-wrap" data-theme={theme}>
      <div style={{ position: 'relative', width: widthPx, height: heightPx }}>
        {editors.map((editor, i) => {
          const isActive = i === activePage
          const isPast = i < activePage
          const pastDepth = activePage - i
          const futureDepth = i - activePage

          const animate = isActive
            ? { x: 0, y: 0, rotate: 0, opacity: 1, zIndex: 50 }
            : isPast
            ? {
                x: `-${86 + pastDepth * 3}%`,
                y: pastDepth * 5,
                rotate: -(3 + pastDepth * 0.8),
                opacity: 1,
                zIndex: 50 - pastDepth,
              }
            : {
                x: `${86 + futureDepth * 3}%`,
                y: futureDepth * 5,
                rotate: 3 + futureDepth * 0.8,
                opacity: 1,
                zIndex: 50 - futureDepth,
              }

          const hover = !isActive
            ? isPast
              ? { x: `-${80 + pastDepth * 3}%`, rotate: -(1 + pastDepth * 0.4), y: pastDepth * 5 - 8 }
              : { x: `${80 + futureDepth * 3}%`, rotate: 1 + futureDepth * 0.4, y: futureDepth * 5 - 8 }
            : undefined

          return (
            <motion.div
              key={i}
              initial={false}
              animate={animate}
              whileHover={hover}
              transition={SPRING}
              onClick={!isActive ? () => onPageClick(i) : undefined}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                cursor: isActive ? 'default' : 'pointer',
                transformOrigin: isPast ? 'left center' : 'right center',
              }}
            >
              <SinglePage
                editor={editor}
                pageSize={pageSize}
                theme={theme}
                toolbar={toolbar}
                ruled={ruled}
                onToggleRuled={onToggleRuled}
                isActive={isActive}
              />
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

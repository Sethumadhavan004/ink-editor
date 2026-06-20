export type PageSize = 'A4' | 'Letter'

export interface PageDimensions {
  widthMm: number
  heightMm: number
  paddingTopMm: number
  paddingBottomMm: number
  paddingLeftMm: number
  paddingRightMm: number
}

export const PAGE_DIMENSIONS: Record<PageSize, PageDimensions> = {
  A4: {
    widthMm: 210, heightMm: 297,
    paddingTopMm: 22, paddingBottomMm: 22,
    paddingLeftMm: 28, paddingRightMm: 28,
  },
  Letter: {
    widthMm: 216, heightMm: 279,
    paddingTopMm: 22, paddingBottomMm: 22,
    paddingLeftMm: 28, paddingRightMm: 28,
  },
}

const PX_PER_MM = 3.7795

export function getBodyHeightPx(size: PageSize): number {
  const d = PAGE_DIMENSIONS[size]
  return Math.round((d.heightMm - d.paddingTopMm - d.paddingBottomMm) * PX_PER_MM)
}

export function getBodyWidthPx(size: PageSize): number {
  const d = PAGE_DIMENSIONS[size]
  return Math.round((d.widthMm - d.paddingLeftMm - d.paddingRightMm) * PX_PER_MM)
}

export function getPageWidthPx(size: PageSize): number {
  const d = PAGE_DIMENSIONS[size]
  return Math.round(d.widthMm * PX_PER_MM)
}

export type Theme = 'parchment' | 'minimal'

export type ToolbarKey =
  | 'bold'
  | 'italic'
  | 'underline'
  | 'h1'
  | 'h2'
  | 'align'
  | 'list'
  | 'indent'
  | 'lines'

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

export type FontKey = 'cursive' | 'serif' | 'sans' | 'slab' | 'mono'

export interface ThemeColors {
  canvasBg: string
  paperColor: string
  textColor: string
  lineColor: string
  accentColor: string
}

export const PARCHMENT_DEFAULTS: ThemeColors = {
  canvasBg: '#e0ddd4',
  paperColor: '#f5f4ed',
  textColor: '#141413',
  lineColor: '#c8c4b8',
  accentColor: '#1b365d',
}

export const MINIMAL_DEFAULTS: ThemeColors = {
  canvasBg: '#e8e8e8',
  paperColor: '#ffffff',
  textColor: '#111111',
  lineColor: '#d0d0d0',
  accentColor: '#2563eb',
}

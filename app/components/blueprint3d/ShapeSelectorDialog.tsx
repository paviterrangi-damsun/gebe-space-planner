'use client'

import { useTranslations } from 'next-intl'
import { ROOM_SHAPES, RoomShape, shapeOutline, Point } from '@/lib/shape-templates'

interface ShapeSelectorDialogProps {
  open: boolean
  onSelect: (shape: RoomShape) => void
  onSkip: () => void
}

const PREVIEW_SIZE = 100
const PREVIEW_PADDING = 10

function toSvgPoints(points: Point[]): string {
  const xs = points.map((p) => p.x)
  const ys = points.map((p) => p.y)
  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  const minY = Math.min(...ys)
  const maxY = Math.max(...ys)
  const width = maxX - minX || 1
  const height = maxY - minY || 1
  const scale = (PREVIEW_SIZE - PREVIEW_PADDING * 2) / Math.max(width, height)

  return points
    .map((p) => {
      const x = PREVIEW_PADDING + (p.x - minX) * scale + (PREVIEW_SIZE - PREVIEW_PADDING * 2 - width * scale) / 2
      const y = PREVIEW_PADDING + (p.y - minY) * scale + (PREVIEW_SIZE - PREVIEW_PADDING * 2 - height * scale) / 2
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
}

export function ShapeSelectorDialog({ open, onSelect, onSkip }: ShapeSelectorDialogProps) {
  const t = useTranslations('BluePrint.shapeSelector')

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] flex flex-col">
      <div className="flex-1 overflow-y-auto">
        <div className="w-full max-w-5xl mx-auto px-4 md:px-8 py-10 md:py-16">
          <div className="text-center mb-10">
            <h1 className="text-2xl md:text-3xl font-semibold text-foreground mb-2">
              {t('title')}
            </h1>
            <p className="text-sm md:text-base text-muted-foreground">{t('description')}</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
            {ROOM_SHAPES.map((shape) => (
              <button
                key={shape}
                onClick={() => onSelect(shape)}
                className="group flex flex-col items-center gap-3 rounded-lg border border-border bg-card p-5 hover:border-primary hover:shadow-md transition-all cursor-pointer"
              >
                <svg
                  width={PREVIEW_SIZE}
                  height={PREVIEW_SIZE}
                  viewBox={`0 0 ${PREVIEW_SIZE} ${PREVIEW_SIZE}`}
                  className="text-muted-foreground group-hover:text-primary transition-colors"
                >
                  <polygon
                    points={toSvgPoints(shapeOutline(shape))}
                    fill="currentColor"
                    fillOpacity="0.12"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="text-sm font-medium text-foreground">{t(`shapes.${shape}`)}</span>
              </button>
            ))}
          </div>

          <div className="mt-10 text-center">
            <button
              onClick={onSkip}
              className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-4 cursor-pointer"
            >
              {t('skip')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

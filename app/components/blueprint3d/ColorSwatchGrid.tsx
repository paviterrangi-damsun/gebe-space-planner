'use client'

import { useCallback, useRef, useState } from 'react'
import { Palette } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { FLOOR_COLORS, CUSTOM_FLOOR_TEXTURE_SCALE, generateSolidColorTexture } from '@/lib/floor-materials'
import { useIsMobile } from '@/hooks/use-media-query'
import { cn } from '@/lib/utils'

interface ColorSwatchGridProps {
  onTextureSelect: (textureUrl: string, stretch: boolean, scale: number) => void
}

const DEFAULT_CUSTOM_COLOR = '#8A8B8D'

/** Preset color swatches plus a native color picker, shared by the floor and wall panels. */
export function ColorSwatchGrid({ onTextureSelect }: ColorSwatchGridProps) {
  const t = useTranslations('BluePrint.textureSelector')
  const isMobile = useIsMobile()
  const colorInputRef = useRef<HTMLInputElement>(null)
  const [customColor, setCustomColor] = useState(DEFAULT_CUSTOM_COLOR)

  const applyColor = useCallback(
    (hex: string) => {
      onTextureSelect(generateSolidColorTexture(hex), true, CUSTOM_FLOOR_TEXTURE_SCALE)
    },
    [onTextureSelect]
  )

  const handleCustomColorChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const hex = e.target.value
      setCustomColor(hex)
      applyColor(hex)
    },
    [applyColor]
  )

  return (
    <div className={cn('grid grid-cols-4', isMobile ? 'gap-3' : 'gap-2')}>
      {FLOOR_COLORS.map((color) => (
        <button
          key={color.key}
          onClick={() => applyColor(color.hex)}
          className="aspect-square rounded-md border-2 border-border hover:border-primary transition-all active:scale-95"
          style={{ backgroundColor: color.hex }}
          title={color.name}
          aria-label={color.name}
        />
      ))}

      <button
        onClick={() => colorInputRef.current?.click()}
        className="relative aspect-square rounded-md border-2 border-border hover:border-primary transition-all active:scale-95 overflow-hidden flex items-center justify-center"
        style={{
          background: 'conic-gradient(from 0deg, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)'
        }}
        title={t('customColor')}
        aria-label={t('customColor')}
      >
        <Palette className="h-4 w-4 text-white" style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.6))' }} />
        <input
          ref={colorInputRef}
          type="color"
          value={customColor}
          onChange={handleCustomColorChange}
          className="absolute inset-0 opacity-0 cursor-pointer"
          aria-label={t('customColor')}
        />
      </button>
    </div>
  )
}

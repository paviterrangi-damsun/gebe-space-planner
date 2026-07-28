'use client'

import { useTranslations } from 'next-intl'
import { useIsMobile } from "@/hooks/use-media-query"
import { cn } from "@/lib/utils"
import { FloorTextureSelector } from './FloorTextureSelector'
import { WallTextureSelector } from './WallTextureSelector'

interface TextureSelectorProps {
  type: 'floor' | 'wall' | null
  onTextureSelect: (textureUrl: string, stretch: boolean, scale: number) => void
}

export function TextureSelector({ type, onTextureSelect }: TextureSelectorProps) {
  const t = useTranslations('BluePrint.textureSelector')
  const isMobile = useIsMobile()

  if (!type) return null

  return (
    <div className={cn(
      'bg-background/95 backdrop-blur-sm border border-border rounded-lg shadow-lg',
      isMobile ? 'p-4 max-w-[300px]' : 'p-3 max-w-[260px]'
    )}>
      {/* Compact header */}
      <h3 className={cn('font-semibold', isMobile ? 'text-base mb-3' : 'text-sm mb-2')}>
        {type === 'floor' ? t('adjustFloor') : t('adjustWall')}
      </h3>

      {type === 'floor' ? (
        <FloorTextureSelector onTextureSelect={onTextureSelect} />
      ) : (
        <WallTextureSelector onTextureSelect={onTextureSelect} />
      )}
    </div>
  )
}

'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Image from 'next/image'
import { toast } from 'sonner'
import { Loader2, Upload } from 'lucide-react'
import { useTranslations } from 'next-intl'
import {
  FLOOR_MATERIALS,
  CUSTOM_FLOOR_TEXTURE_SCALE,
  readAndDownscaleImage
} from '@/lib/floor-materials'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ColorSwatchGrid } from './ColorSwatchGrid'
import { useIsMobile } from '@/hooks/use-media-query'
import { cn } from '@/lib/utils'

interface FloorTextureSelectorProps {
  onTextureSelect: (textureUrl: string, stretch: boolean, scale: number) => void
}

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024 // 10MB

export function FloorTextureSelector({ onTextureSelect }: FloorTextureSelectorProps) {
  const t = useTranslations('BluePrint.textureSelector')
  const isMobile = useIsMobile()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [materialThumbs, setMaterialThumbs] = useState<Record<string, string>>({})
  const [uploading, setUploading] = useState(false)

  // Canvas-drawn previews are client-only, so generate them after mount.
  useEffect(() => {
    const thumbs: Record<string, string> = {}
    FLOOR_MATERIALS.forEach((material) => {
      thumbs[material.key] = material.generate()
    })
    setMaterialThumbs(thumbs)
  }, [])

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      e.target.value = ''
      if (!file) return

      if (!file.type.startsWith('image/')) {
        toast.error(t('uploadInvalidType'))
        return
      }
      if (file.size > MAX_UPLOAD_BYTES) {
        toast.error(t('uploadTooLarge'))
        return
      }

      setUploading(true)
      try {
        const dataUrl = await readAndDownscaleImage(file)
        onTextureSelect(dataUrl, true, CUSTOM_FLOOR_TEXTURE_SCALE)
      } catch (error) {
        console.error('Failed to process uploaded floor image:', error)
        toast.error(t('uploadError'))
      } finally {
        setUploading(false)
      }
    },
    [onTextureSelect, t]
  )

  const swatchClass = cn(
    'relative aspect-square border-2 border-border rounded-md hover:border-primary transition-all overflow-hidden active:scale-95 bg-muted',
    !isMobile && 'hover:scale-105'
  )

  return (
    <Tabs defaultValue="materials">
      <TabsList className="w-full grid grid-cols-3 mb-2">
        <TabsTrigger value="materials" className="text-xs">
          {t('materials')}
        </TabsTrigger>
        <TabsTrigger value="colors" className="text-xs">
          {t('colors')}
        </TabsTrigger>
        <TabsTrigger value="upload" className="text-xs">
          {t('upload')}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="materials">
        <div className={cn('grid grid-cols-2', isMobile ? 'gap-3' : 'gap-2')}>
          {FLOOR_MATERIALS.map((material) => (
            <button
              key={material.key}
              onClick={() => onTextureSelect(material.generate(), true, material.scale)}
              className={swatchClass}
              title={material.name}
            >
              {materialThumbs[material.key] && (
                <Image
                  src={materialThumbs[material.key]}
                  alt={material.name}
                  fill
                  sizes="100px"
                  className="object-cover"
                />
              )}
            </button>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="colors">
        <ColorSwatchGrid onTextureSelect={onTextureSelect} />
      </TabsContent>

      <TabsContent value="upload">
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="w-full border-2 border-dashed border-border rounded-md py-6 flex flex-col items-center gap-2 hover:border-primary transition-colors disabled:opacity-60 cursor-pointer"
        >
          {uploading ? (
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          ) : (
            <Upload className="h-5 w-5 text-muted-foreground" />
          )}
          <span className="text-xs text-muted-foreground text-center px-2">
            {uploading ? t('uploading') : t('uploadHint')}
          </span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </TabsContent>
    </Tabs>
  )
}

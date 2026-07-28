'use client'

import { useCallback, useRef, useState } from 'react'
import { toast } from 'sonner'
import { Loader2, Upload } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { CUSTOM_FLOOR_TEXTURE_SCALE, readAndDownscaleImage } from '@/lib/floor-materials'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ColorSwatchGrid } from './ColorSwatchGrid'

interface WallTextureSelectorProps {
  onTextureSelect: (textureUrl: string, stretch: boolean, scale: number) => void
}

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024 // 10MB

export function WallTextureSelector({ onTextureSelect }: WallTextureSelectorProps) {
  const t = useTranslations('BluePrint.textureSelector')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

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
        console.error('Failed to process uploaded wall image:', error)
        toast.error(t('uploadError'))
      } finally {
        setUploading(false)
      }
    },
    [onTextureSelect, t]
  )

  return (
    <Tabs defaultValue="colors">
      <TabsList className="w-full grid grid-cols-2 mb-2">
        <TabsTrigger value="colors" className="text-xs">
          {t('colors')}
        </TabsTrigger>
        <TabsTrigger value="upload" className="text-xs">
          {t('upload')}
        </TabsTrigger>
      </TabsList>

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
            {uploading ? t('uploading') : t('uploadHintWall')}
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

'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import { ITEMS, itemSuitsShape, type ItemCategory } from '@blueprint3d/constants'
import type { RoomShape } from '@/lib/shape-templates'
import { useTranslations } from 'next-intl'
import { Button } from "@/components/ui/button"

interface ItemsListProps {
  onItemSelect: (item: {
    name: string
    key: string
    model: string
    type: string
    scale?: { x: number; y: number; z: number }
  }) => void
  roomShape: RoomShape | null
}

const CATEGORY_KEYS = {
  all: 'all',
  sofa: 'sofa'
} as const

const CATEGORY_VALUES: Array<'all' | 'sofa'> = ['all', 'sofa']

export function ItemsList({ onItemSelect, roomShape }: ItemsListProps) {
  const t = useTranslations('BluePrint.items')
  const tShapes = useTranslations('BluePrint.shapeSelector.shapes')

  const [selectedCategory, setSelectedCategory] = useState<ItemCategory | 'all'>('all')

  // Build categories with translated labels
  const categories = useMemo(() => {
    return CATEGORY_VALUES.map((value) => ({
      value,
      label: t(`categories.${CATEGORY_KEYS[value]}`)
    }))
  }, [t])

  // Filter items based on selected category and the current room's shape
  const filteredItems = useMemo(() => {
    let items = ITEMS

    if (selectedCategory !== 'all') {
      items = items.filter((item) => item.category === selectedCategory)
    }

    items = items.filter((item) => itemSuitsShape(item, roomShape))

    return items
  }, [selectedCategory, roomShape])

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Current shape indicator */}
      {roomShape && (
        <p className="text-xs text-muted-foreground">
          {t('list.shownForShape', { shape: tShapes(roomShape) })}
        </p>
      )}

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <Button
            key={category.value}
            variant={selectedCategory === category.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(category.value)}
            className="whitespace-nowrap"
          >
            {category.label}
          </Button>
        ))}
      </div>

      {/* Items Grid - Responsive: 2 cols on mobile, 3 on tablet, 4 on desktop */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
        {filteredItems.map((item, index) => (
          <button
            key={index}
            onClick={() =>
              onItemSelect({
                name: item.name,
                key: item.key,
                model: item.model,
                type: item.type,
                scale: item.scale
              })
            }
            className="border border-border rounded hover:border-primary active:border-primary transition-colors p-2 sm:p-2 flex flex-col items-center gap-1.5 sm:gap-2 cursor-pointer bg-card group min-h-[120px] sm:min-h-[140px]"
          >
            <div className="relative w-full aspect-square">
              <Image
                src={item.image}
                alt={t(item.key)}
                fill
                sizes="(max-width: 768px) 25vw, 10vw"
                className="object-contain"
              />
            </div>
            <div className="flex flex-col items-center gap-0.5 sm:gap-1 w-full">
              <span className="text-xs sm:text-xs text-center font-medium leading-tight">
                {t(item.key)}
              </span>
              {/* {item.description && (
                <span className="text-[10px] text-muted-foreground text-center sm:opacity-0 sm:group-hover:opacity-100 transition-opacity line-clamp-2">
                  {item.description}
                </span>
              )} */}
            </div>
          </button>
        ))}
      </div>

      {/* Empty State */}
      {filteredItems.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-sm">{t('list.noItemsFound')}</p>
          <p className="text-xs mt-2">{t('list.selectDifferentCategory')}</p>
        </div>
      )}
    </div>
  )
}

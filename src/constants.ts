// Item categories
export type ItemCategory =
  | 'bed'
  | 'drawer'
  | 'wardrobe'
  | 'light'
  | 'storage'
  | 'table'
  | 'chair'
  | 'sofa'
  | 'armchair'
  | 'stool'
  | 'door'
  | 'window'

// Room floor shapes (must match app/lib/shape-templates.ts's ROOM_SHAPES)
export const ROOM_SHAPES = [
  'square',
  'rectangle',
  'l-shape',
  'corner',
  'blunt-corner',
  't-shape',
  'u-shape',
  'z-shape',
  's-shape',
  'triangle',
  'circle'
] as const

export type RoomShape = (typeof ROOM_SHAPES)[number]

export interface Item {
  key: string
  name: string
  image: string
  model: string
  type: string
  category: ItemCategory
  description?: string
  /** Corrective scale applied on placement, for models not authored in meters. */
  scale?: { x: number; y: number; z: number }
  /** Room shapes this product suits. Omit to show it for every shape. */
  shapes?: RoomShape[]
}

/** True if an item should be shown for the given room shape (untagged items suit every shape). */
export function itemSuitsShape(item: Item, shape: RoomShape | null): boolean {
  if (!item.shapes || item.shapes.length === 0) return true
  if (!shape) return true
  return item.shapes.includes(shape)
}

// Items data
export const ITEMS: Item[] = [
  {
    key: 'kawaSingleSeaterSofa',
    name: 'Kawa Single Seater Sofa',
    description: 'Kawa Single Seater Sofa',
    image: '/images/kawa-single-seater-sofa.png',
    model: '/models/kawa-single-seater-sofa.glb',
    type: '1',
    category: 'sofa',
    // Model's authored scale renders ~11x too large otherwise; empirically tuned.
    scale: { x: 0.1, y: 0.1, z: 0.1 }
  },
  {
    key: 'kawaTwoSeaterSofa',
    name: 'Kawa Two Seater Sofa',
    description: 'Kawa Two Seater Sofa',
    image: '/images/kawa-two-seater-sofa.png',
    model: '/models/kawa-two-seater-sofa.glb',
    type: '1',
    category: 'sofa',
    // Model's authored scale renders ~11x too large otherwise; empirically tuned.
    scale: { x: 0.1, y: 0.1, z: 0.1 }
  },
  {
    key: 'kawaThreeSeaterSofa',
    name: 'Kawa Three Seater Sofa',
    description: 'Kawa Three Seater Sofa',
    image: '/images/kawa-three-seater-sofa.png',
    model: '/models/kawa-three-seater-sofa.glb',
    type: '1',
    category: 'sofa',
    // Model's authored scale renders ~11x too large otherwise; empirically tuned.
    scale: { x: 0.1, y: 0.1, z: 0.1 }
  }
]


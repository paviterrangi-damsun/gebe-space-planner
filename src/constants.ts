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
    key: 'chairOne',
    name: 'Chair',
    description: 'Chair',
    image: '/images/chair-1.png',
    model: '/models/chair-1.glb',
    type: '1',
    category: 'chair',
    // Model is authored in centimeters; GLBLoader assumes meters and multiplies by 100,
    // so this counteracts that to render at the model's real-world size.
    scale: { x: 0.01, y: 0.01, z: 0.01 }
  }
]


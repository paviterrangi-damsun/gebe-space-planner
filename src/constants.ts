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
  | 'lounger'
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
  },
  {
    key: 'coreSingleSeaterSofa',
    name: 'Core Single Seater Sofa',
    description: 'Core Single Seater Sofa',
    image: '/images/core-single-seater-sofa.png',
    model: '/models/core-one-seater-sofa.glb',
    type: '1',
    category: 'sofa',
    // Model's authored scale renders far too large otherwise; empirically tuned.
    scale: { x: 0.13, y: 0.13, z: 0.13 }
  },
  {
    key: 'coreTwoSeaterSofa',
    name: 'Core Two Seater Sofa',
    description: 'Core Two Seater Sofa',
    image: '/images/core-two-seater-sofa.png',
    model: '/models/core-two-seater-sofa.glb',
    type: '1',
    category: 'sofa',
    // Model's authored scale renders far too large otherwise; empirically tuned.
    scale: { x: 0.13, y: 0.13, z: 0.13 }
  },
  {
    key: 'coreThreeSeaterSofa',
    name: 'Core Three Seater Sofa',
    description: 'Core Three Seater Sofa',
    image: '/images/core-three-seater-sofa.png',
    model: '/models/core-three-seater-sofa.glb',
    type: '1',
    category: 'sofa',
    // Model's authored scale renders far too large otherwise; empirically tuned.
    scale: { x: 0.13, y: 0.13, z: 0.13 }
  },
  {
    key: 'coreTable',
    name: 'Core Table',
    description: 'Core Table',
    image: '/images/core-table.png',
    model: '/models/core-table.glb',
    type: '1',
    category: 'table',
    // Model's authored scale renders far too large otherwise; empirically tuned.
    scale: { x: 0.16, y: 0.16, z: 0.16 }
  },
  {
    key: 'cocoonDaybed',
    name: 'Cocoon Daybed',
    description: 'Cocoon Daybed',
    image: '/images/cocoon-daybed.png',
    model: '/models/cocoon-daybed.glb',
    type: '1',
    category: 'lounger',
    // Model's authored scale renders far too large otherwise; empirically tuned.
    scale: { x: 0.115, y: 0.115, z: 0.115 }
  },
  {
    key: 'oraLounger',
    name: 'Ora Lounger',
    description: 'Ora Lounger',
    image: '/images/ora-lounger.png',
    model: '/models/ora-lounger.glb',
    type: '1',
    category: 'lounger',
    // Model's authored scale renders far too large otherwise; empirically tuned.
    scale: { x: 0.1, y: 0.1, z: 0.1 }
  }
]


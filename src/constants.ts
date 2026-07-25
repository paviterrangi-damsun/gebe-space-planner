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

// Floor textures
export const FLOOR_TEXTURES = [
  {
    name: 'Light Fine Wood',
    thumbnail: 'https://cdn-images.archybase.com/archybase/blueprint3d/covers/thumbnail_light_fine_wood.jpg',
    url: 'https://cdn-images.archybase.com/archybase/blueprint3d/covers/light_fine_wood.jpg',
    stretch: false,
    scale: 300
  }
]

// Wall textures
export const WALL_TEXTURES = [
  {
    name: 'Marble Tiles',
    thumbnail: 'https://cdn-images.archybase.com/archybase/blueprint3d/covers/thumbnail_marbletiles.jpg',
    url: 'https://cdn-images.archybase.com/archybase/blueprint3d/covers/marbletiles.jpg',
    stretch: false,
    scale: 300
  },
  {
    name: 'Wallmap Yellow',
    thumbnail: 'https://cdn-images.archybase.com/archybase/blueprint3d/covers/thumbnail_wallmap_yellow.png',
    url: 'https://cdn-images.archybase.com/archybase/blueprint3d/covers/wallmap_yellow.png',
    stretch: true,
    scale: 0
  },
  {
    name: 'Light Brick',
    thumbnail: 'https://cdn-images.archybase.com/archybase/blueprint3d/covers/thumbnail_light_brick.jpg',
    url: 'https://cdn-images.archybase.com/archybase/blueprint3d/covers/light_brick.jpg',
    stretch: false,
    scale: 100
  }
]

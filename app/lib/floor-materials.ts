/**
 * Client-only floor customization helpers: procedurally generated material
 * swatches (wood/marble/granite/tile), solid-color swatches, and custom
 * image upload processing. Every option ultimately resolves to a plain
 * image URL (a canvas data URI, in most cases) so it can flow through the
 * existing floor-texture pipeline (Room.setTexture) unchanged.
 */

/** Deterministic PRNG so a given material's pattern doesn't change between generations. */
function mulberry32(seed: number) {
  let state = seed
  return function random() {
    state |= 0
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function createCanvas(size: number): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('2D canvas context unavailable')
  return { canvas, ctx }
}

/** A flat color as a tileable image, for use as a floor "texture". */
export function generateSolidColorTexture(hex: string): string {
  // 64px (not, say, 8px) so mipmap generation behaves the same as every
  // other generated texture rather than hitting tiny-texture edge cases.
  const size = 64
  const { canvas, ctx } = createCanvas(size)
  ctx.fillStyle = hex
  ctx.fillRect(0, 0, size, size)
  return canvas.toDataURL('image/png')
}

function generateWoodTexture(baseHex: string, seed: number): string {
  const size = 256
  const { canvas, ctx } = createCanvas(size)
  const random = mulberry32(seed)

  ctx.fillStyle = baseHex
  ctx.fillRect(0, 0, size, size)

  const plankWidth = size / 4
  for (let plank = 0; plank < 4; plank++) {
    const x0 = plank * plankWidth

    for (let i = 0; i < 16; i++) {
      const y = random() * size
      const amplitude = 3 + random() * 5
      ctx.strokeStyle = `rgba(50,25,10,${0.04 + random() * 0.08})`
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(x0 + 3, y)
      for (let x = x0 + 3; x < x0 + plankWidth - 3; x += 6) {
        ctx.lineTo(x, y + Math.sin(x * 0.09 + i) * amplitude * 0.3)
      }
      ctx.stroke()
    }

    ctx.strokeStyle = 'rgba(0,0,0,0.18)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(x0, 0)
    ctx.lineTo(x0, size)
    ctx.stroke()
  }

  return canvas.toDataURL('image/png')
}

function generateMarbleTexture(baseHex: string, veinHex: string, seed: number): string {
  const size = 256
  const { canvas, ctx } = createCanvas(size)
  const random = mulberry32(seed)

  ctx.fillStyle = baseHex
  ctx.fillRect(0, 0, size, size)

  for (let vein = 0; vein < 7; vein++) {
    ctx.strokeStyle = veinHex
    ctx.globalAlpha = 0.2 + random() * 0.35
    ctx.lineWidth = 1 + random() * 2
    ctx.beginPath()
    let x = random() * size
    let y = 0
    ctx.moveTo(x, y)
    while (y < size) {
      x += (random() - 0.5) * 46
      y += 18 + random() * 22
      ctx.lineTo(x, y)
    }
    ctx.stroke()
  }
  ctx.globalAlpha = 1

  return canvas.toDataURL('image/png')
}

function generateGraniteTexture(baseHex: string, seed: number): string {
  const size = 256
  const { canvas, ctx } = createCanvas(size)
  const random = mulberry32(seed)

  ctx.fillStyle = baseHex
  ctx.fillRect(0, 0, size, size)

  for (let i = 0; i < 1100; i++) {
    const dark = random() < 0.5
    ctx.fillStyle = `rgba(${dark ? '0,0,0' : '255,255,255'},${0.05 + random() * 0.22})`
    const radius = 0.4 + random() * 1.6
    ctx.beginPath()
    ctx.arc(random() * size, random() * size, radius, 0, Math.PI * 2)
    ctx.fill()
  }

  return canvas.toDataURL('image/png')
}

function generateTileTexture(baseHex: string, groutHex: string, tilesPerSide: number): string {
  const size = 256
  const { canvas, ctx } = createCanvas(size)

  ctx.fillStyle = groutHex
  ctx.fillRect(0, 0, size, size)

  const tile = size / tilesPerSide
  const gap = 4
  for (let ty = 0; ty < tilesPerSide; ty++) {
    for (let tx = 0; tx < tilesPerSide; tx++) {
      ctx.fillStyle = baseHex
      ctx.fillRect(tx * tile + gap / 2, ty * tile + gap / 2, tile - gap, tile - gap)
    }
  }

  return canvas.toDataURL('image/png')
}

export interface FloorMaterialOption {
  key: string
  name: string
  /** cm per texture repeat, tuned per material so the pattern reads at a believable scale. */
  scale: number
  generate: () => string
}

export const FLOOR_MATERIALS: FloorMaterialOption[] = [
  { key: 'wood-oak', name: 'Oak Wood', scale: 260, generate: () => generateWoodTexture('#D8B78C', 1) },
  { key: 'wood-walnut', name: 'Walnut Wood', scale: 260, generate: () => generateWoodTexture('#6B4226', 2) },
  { key: 'marble-white', name: 'White Marble', scale: 420, generate: () => generateMarbleTexture('#F3F1EC', '#B8AFA1', 3) },
  { key: 'marble-black', name: 'Black Marble', scale: 420, generate: () => generateMarbleTexture('#2B2B2E', '#C9A24B', 4) },
  { key: 'granite-grey', name: 'Grey Granite', scale: 380, generate: () => generateGraniteTexture('#8A8B8D', 5) },
  { key: 'granite-sand', name: 'Sand Granite', scale: 380, generate: () => generateGraniteTexture('#C9B497', 6) },
  { key: 'tile-white', name: 'White Tiles', scale: 140, generate: () => generateTileTexture('#F5F5F2', '#C7C7C2', 4) },
  { key: 'tile-slate', name: 'Slate Tiles', scale: 140, generate: () => generateTileTexture('#4B4E52', '#2B2D30', 4) }
]

export interface FloorColorOption {
  key: string
  name: string
  hex: string
}

export const FLOOR_COLORS: FloorColorOption[] = [
  { key: 'white', name: 'White', hex: '#FFFFFF' },
  { key: 'light-grey', name: 'Light Grey', hex: '#D9D9D6' },
  { key: 'warm-beige', name: 'Warm Beige', hex: '#E4D3B8' },
  { key: 'sand', name: 'Sand', hex: '#D8C39A' },
  { key: 'walnut-brown', name: 'Walnut Brown', hex: '#5A3A22' },
  { key: 'charcoal', name: 'Charcoal', hex: '#3A3B3E' },
  { key: 'slate-blue', name: 'Slate Blue', hex: '#5D6E7A' },
  { key: 'sage-green', name: 'Sage Green', hex: '#8A9A82' },
  { key: 'terracotta', name: 'Terracotta', hex: '#C1704A' },
  { key: 'black', name: 'Black', hex: '#1C1C1E' }
]

/** Default cm-per-repeat used for solid colors and custom uploads (tiling is invisible/irrelevant for these). */
export const CUSTOM_FLOOR_TEXTURE_SCALE = 300

/** Reads an image file, downscales it if needed, and returns a data URI ready to use as a floor texture. */
export function readAndDownscaleImage(file: File, maxDimension = 1024): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Failed to read the selected file'))
    reader.onload = () => {
      const img = new Image()
      img.onerror = () => reject(new Error('Failed to decode the selected image'))
      img.onload = () => {
        let { width, height } = img
        if (width > maxDimension || height > maxDimension) {
          const ratio = Math.min(maxDimension / width, maxDimension / height)
          width = Math.round(width * ratio)
          height = Math.round(height * ratio)
        }
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('2D canvas context unavailable'))
          return
        }
        ctx.drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg', 0.88))
      }
      img.src = reader.result as string
    }
    reader.readAsDataURL(file)
  })
}

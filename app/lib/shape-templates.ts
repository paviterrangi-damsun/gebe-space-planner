/**
 * Generates a starting floorplan (corners + walls, in cm) for a given room shape,
 * so a user can begin their plan from a shape outline instead of drawing walls by hand.
 */
import type { Blueprint3DTemplate } from '@blueprint3d/indexdb/blueprint-template'
import { ROOM_SHAPES, type RoomShape } from '@blueprint3d/constants'

export { ROOM_SHAPES, type RoomShape }

export interface Point {
  x: number
  y: number
}

function circlePoints(sides: number, radius: number, cx: number, cy: number): Point[] {
  return Array.from({ length: sides }, (_, i) => {
    const theta = (i / sides) * Math.PI * 2
    return {
      x: Math.round(cx + radius * Math.cos(theta)),
      y: Math.round(cy + radius * Math.sin(theta))
    }
  })
}

/** Outline points (in order around the polygon) for each shape, in cm. */
export function shapeOutline(shape: RoomShape): Point[] {
  switch (shape) {
    case 'square':
      return [
        { x: 0, y: 0 },
        { x: 450, y: 0 },
        { x: 450, y: 450 },
        { x: 0, y: 450 }
      ]
    case 'rectangle':
      return [
        { x: 0, y: 0 },
        { x: 600, y: 0 },
        { x: 600, y: 400 },
        { x: 0, y: 400 }
      ]
    case 'l-shape':
      return [
        { x: 0, y: 0 },
        { x: 200, y: 0 },
        { x: 200, y: 300 },
        { x: 500, y: 300 },
        { x: 500, y: 500 },
        { x: 0, y: 500 }
      ]
    case 'corner':
      return [
        { x: 0, y: 0 },
        { x: 200, y: 0 },
        { x: 200, y: 200 },
        { x: 400, y: 200 },
        { x: 400, y: 400 },
        { x: 0, y: 400 }
      ]
    case 'blunt-corner':
      return [
        { x: 0, y: 0 },
        { x: 380, y: 0 },
        { x: 500, y: 120 },
        { x: 500, y: 400 },
        { x: 0, y: 400 }
      ]
    case 't-shape':
      return [
        { x: 0, y: 0 },
        { x: 500, y: 0 },
        { x: 500, y: 150 },
        { x: 325, y: 150 },
        { x: 325, y: 500 },
        { x: 175, y: 500 },
        { x: 175, y: 150 },
        { x: 0, y: 150 }
      ]
    case 'u-shape':
      return [
        { x: 0, y: 0 },
        { x: 150, y: 0 },
        { x: 150, y: 350 },
        { x: 350, y: 350 },
        { x: 350, y: 0 },
        { x: 500, y: 0 },
        { x: 500, y: 500 },
        { x: 0, y: 500 }
      ]
    case 'z-shape':
      return [
        { x: 150, y: 0 },
        { x: 500, y: 0 },
        { x: 500, y: 150 },
        { x: 350, y: 150 },
        { x: 350, y: 350 },
        { x: 350, y: 500 },
        { x: 0, y: 500 },
        { x: 0, y: 350 },
        { x: 150, y: 350 },
        { x: 150, y: 150 }
      ]
    case 's-shape':
      return [
        { x: 350, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 150 },
        { x: 150, y: 150 },
        { x: 150, y: 350 },
        { x: 150, y: 500 },
        { x: 500, y: 500 },
        { x: 500, y: 350 },
        { x: 350, y: 350 },
        { x: 350, y: 150 }
      ]
    case 'triangle':
      return [
        { x: 0, y: 500 },
        { x: 500, y: 500 },
        { x: 250, y: 67 }
      ]
    case 'circle':
      return circlePoints(28, 250, 250, 250)
  }
}

/** Shoelace signed area; negative means the points wind clockwise. */
function signedArea(points: Point[]): number {
  let sum = 0
  for (let i = 0; i < points.length; i++) {
    const a = points[i]
    const b = points[(i + 1) % points.length]
    sum += a.x * b.y - b.x * a.y
  }
  return sum / 2
}

/** Builds a loadable floorplan template (corners + walls) outlining the given shape. */
export function buildShapeTemplate(shape: RoomShape): Blueprint3DTemplate {
  const outline = shapeOutline(shape)
  // Floors/walls render correctly only when corners wind clockwise, matching
  // the engine's default template — flip counter-clockwise outlines to match.
  const points = signedArea(outline) > 0 ? [...outline].reverse() : outline
  const ids = points.map((_, i) => `shape-${shape}-${i}`)

  const corners: Record<string, Point> = {}
  points.forEach((point, i) => {
    corners[ids[i]] = point
  })

  const walls = ids.map((id, i) => ({
    corner1: id,
    corner2: ids[(i + 1) % ids.length]
  }))

  return {
    floorplan: {
      corners,
      walls,
      wallTextures: [],
      floorTextures: {},
      newFloorTextures: {}
    },
    items: []
  }
}

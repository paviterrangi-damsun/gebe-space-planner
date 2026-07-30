import * as THREE from 'three'
import { animate } from 'animejs'
import { EventEmitter } from '../core/events'
import { Controller } from './controller'
import { FloorplanThree } from './floorplan'
import { Lights } from './lights'
import { Skybox } from './skybox'
import { Controls } from './controls'
import { HUD } from './hud'
import type { Model } from '../model/model'
import type { Scene } from '../model/scene'
import type { Item } from '../items/item'
import type { HalfEdge } from '../model/half_edge'
import type { Room } from '../model/room'

interface MainOptions {
  resize?: boolean
  pushHref?: boolean
  spin?: boolean
  spinSpeed?: number
  clickPan?: boolean
  canMoveFixedItems?: boolean
  enableWheelZoom?: boolean
  alwaysSpin?: boolean // Keep spinning even after user interaction
}

export class Main {
  public readonly element: HTMLElement
  public controls!: Controls
  public heightMargin!: number
  public widthMargin!: number
  public elementHeight!: number
  public elementWidth!: number

  public itemSelectedCallbacks = new EventEmitter<Item>() // item
  public itemUnselectedCallbacks = new EventEmitter<void>()
  public wallClicked = new EventEmitter<HalfEdge>() // wall
  public floorClicked = new EventEmitter<Room>() // floor
  public nothingClicked = new EventEmitter<void>()

  private readonly options: Required<MainOptions>
  public readonly scene: Scene
  private readonly model: Model
  private domElement!: HTMLElement
  public camera!: THREE.PerspectiveCamera
  public renderer!: THREE.WebGLRenderer
  private controller!: Controller
  // @ts-ignore - floorplan is declared but not used, keeping for future use
  private floorplan!: FloorplanThree
  private _needsUpdate = false
  private lastRender = Date.now()
  private mouseOver = false
  private hasClicked = false
  private hud!: HUD
  private viewMode: '2d' | '3d' = '3d'
  private saved3DPosition: THREE.Vector3 | null = null
  // @ts-ignore - saved3DRotation is declared but not used, keeping for future use
  private saved3DRotation: { theta: number; phi: number } | null = null

  constructor(
    model: Model,
    element: HTMLElement | string,
    canvasElement?: HTMLElement,
    opts?: MainOptions
  ) {
    this.model = model
    this.scene = model.scene
    // Convert string selector to DOM element if needed
    this.element =
      typeof element === 'string' ? (document.querySelector(element) as HTMLElement) : element

    const defaultOptions: Required<MainOptions> = {
      resize: true,
      pushHref: false,
      spin: true,
      spinSpeed: 0.00002,
      clickPan: true,
      canMoveFixedItems: false,
      enableWheelZoom: true,
      alwaysSpin: false
    }

    // override with manually set options
    this.options = { ...defaultOptions, ...opts }

    this.init()
  }

  private init(): void {
    this.domElement = this.element // Container
    this.camera = new THREE.PerspectiveCamera(45, 1, 1, 10000)
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      preserveDrawingBuffer: true // required to support .toDataURL()
    })
    this.renderer.autoClear = false
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFShadowMap // Optimized: PCFShadowMap is faster than PCFSoftShadowMap
    // Fix color space for proper color saturation (matching legacy behavior)
    this.renderer.outputColorSpace = THREE.SRGBColorSpace

    // Get skybox colors from CSS variables (if available)
    const { topColor, bottomColor } = this.getSkyboxColors()
    // @ts-ignore - Item is imported but not used, keeping for future use
    const skybox = new Skybox(this.scene.getScene(), topColor, bottomColor)

    this.controls = new Controls(this.camera, this.domElement, this.options.enableWheelZoom)

    this.hud = new HUD(this)

    this.controller = new Controller(
      this,
      this.model,
      this.camera,
      this.element,
      this.controls,
      this.hud
    )

    this.domElement.appendChild(this.renderer.domElement)

    // handle window resizing
    this.updateWindowSize()
    if (this.options.resize) {
      window.addEventListener('resize', this.updateWindowSize.bind(this))
    }

    // setup camera nicely
    this.centerCamera()
    this.model.floorplan.fireOnUpdatedRooms(this.centerCamera.bind(this))

    // @ts-ignore - Item is imported but not used, keeping for future use
    const lights = new Lights(this.scene.getScene(), this.model.floorplan)

    this.floorplan = new FloorplanThree(this.scene.getScene(), this.model.floorplan, this.controls, this.renderer)

    this.animate()

    this.element.addEventListener('mouseenter', () => {
      this.mouseOver = true
    })
    this.element.addEventListener('mouseleave', () => {
      this.mouseOver = false
    })
    this.element.addEventListener('click', () => {
      this.hasClicked = true
    })
  }

  /** Flat canvas background color (top and bottom of the skybox gradient are the same). */
  private getSkyboxColors(): { topColor: number; bottomColor: number } {
    const canvasBackgroundColor = 0xFFFFFF
    return { topColor: canvasBackgroundColor, bottomColor: canvasBackgroundColor }
  }

  private spin(): void {
    // If alwaysSpin is enabled, spin continuously regardless of user interaction
    const shouldSpin = this.options.spin && (this.options.alwaysSpin || (!this.mouseOver && !this.hasClicked))

    if (shouldSpin) {
      const theta = 2 * Math.PI * this.options.spinSpeed * (Date.now() - this.lastRender)
      this.controls.rotateLeft(theta)
      this.controls.update()
    }
  }

  public dataUrl(): string {
    const dataUrl = this.renderer.domElement.toDataURL('image/png')
    return dataUrl
  }

  public stopSpin(): void {
    this.hasClicked = true
  }

  public getOptions(): Required<MainOptions> {
    return this.options
  }

  public getModel(): Model {
    return this.model
  }

  public getScene(): Scene {
    return this.scene
  }

  public getController(): Controller {
    return this.controller
  }

  public getCamera(): THREE.PerspectiveCamera {
    return this.camera
  }

  public needsUpdate(): void {
    this._needsUpdate = true
  }

  private shouldRender(): boolean {
    // Do we need to draw a new frame
    if (
      this.controls.needsUpdate ||
      this.controller.needsUpdate ||
      this._needsUpdate ||
      this.model.scene.needsUpdate
    ) {
      this.controls.needsUpdate = false
      this.controller.needsUpdate = false
      this._needsUpdate = false
      this.model.scene.needsUpdate = false
      return true
    } else {
      return false
    }
  }

  private render(): void {
    this.spin()
    if (this.shouldRender()) {
      this.renderer.clear()
      this.renderer.render(this.scene.getScene(), this.camera)
      this.renderer.clearDepth()
      this.renderer.render(this.hud.getScene(), this.camera)
    }
    this.lastRender = Date.now()
  }

  private animate(): void {
    requestAnimationFrame(this.animate.bind(this))
    this.render()
  }

  public setCursorStyle(cursorStyle: string): void {
    this.domElement.style.cursor = cursorStyle
  }

  public updateWindowSize(): void {
    const rect = this.element.getBoundingClientRect()
    this.heightMargin = rect.top
    this.widthMargin = rect.left

    this.elementWidth = this.element.clientWidth
    if (this.options.resize) {
      this.elementHeight = window.innerHeight - this.heightMargin
    } else {
      this.elementHeight = this.element.clientHeight
    }

    this.camera.aspect = this.elementWidth / this.elementHeight
    this.camera.updateProjectionMatrix()

    this.renderer.setSize(this.elementWidth, this.elementHeight)
    this._needsUpdate = true
  }

  public centerCamera(): void {
    const yOffset = 150.0

    const pan = this.model.floorplan.getCenter()
    pan.y = yOffset

    this.controls.target = pan

    const distance = this.model.floorplan.getSize().z * 1.5

    const offset = pan.clone().add(new THREE.Vector3(0, distance, distance))
    this.camera.position.copy(offset)

    this.controls.update()
  }

  // projects the object's center point into x,y screen coords
  // x,y are relative to top left corner of viewer
  public projectVector(vec3: THREE.Vector3, ignoreMargin?: boolean): THREE.Vector2 {
    const _ignoreMargin = ignoreMargin ?? false

    const widthHalf = this.elementWidth / 2
    const heightHalf = this.elementHeight / 2

    const vector = new THREE.Vector3()
    vector.copy(vec3)
    vector.project(this.camera)

    const vec2 = new THREE.Vector2()

    vec2.x = vector.x * widthHalf + widthHalf
    vec2.y = -(vector.y * heightHalf) + heightHalf

    if (!_ignoreMargin) {
      vec2.x += this.widthMargin
      vec2.y += this.heightMargin
    }

    return vec2
  }

  public getViewMode(): '2d' | '3d' {
    return this.viewMode
  }

  public setViewMode(mode: '2d' | '3d'): void {
    if (this.viewMode === mode) return

    this.viewMode = mode

    if (mode === '2d') {
      // Save current 3D position
      this.saved3DPosition = this.camera.position.clone()

      // Switch to 2D top-down view
      const center = this.model.floorplan.getCenter()
      const size = this.model.floorplan.getSize()
      const maxDim = Math.max(size.x, size.z)
      // Increase distance to reduce perspective distortion and wall blocking
      const distance = maxDim * 1.5 // Increased from 1.2 to 2.0

      const targetPosition = { x: center.x, y: distance, z: center.z }
      const targetLookAt = { x: center.x, y: 0, z: center.z }

      // Animate camera position and controls target simultaneously
      animate(this.camera.position, {
        x: targetPosition.x,
        y: targetPosition.y,
        z: targetPosition.z,
        duration: 800,
        ease: 'inOut(2)', // easeInOutQuad equivalent
        onUpdate: () => {
          this.controls.update()
          this._needsUpdate = true
        }
      })

      animate(this.controls.target, {
        x: targetLookAt.x,
        y: targetLookAt.y,
        z: targetLookAt.z,
        duration: 800,
        ease: 'inOut(2)'
      })

      // Disable rotation in 2D mode
      this.controls.noRotate = true
      this.controls.maxPolarAngle = 0
      this.controls.minPolarAngle = 0
    } else {
      // Restore 3D view
      let targetPosition: THREE.Vector3
      if (this.saved3DPosition) {
        targetPosition = this.saved3DPosition
      } else {
        // Calculate centered position
        const center = this.model.floorplan.getCenter()
        const size = this.model.floorplan.getSize()
        const maxDim = Math.max(size.x, size.z)
        const distance = maxDim * 1.5
        targetPosition = new THREE.Vector3(
          center.x + distance * 0.7,
          distance * 0.8,
          center.z + distance * 0.7
        )
      }

      // Animate camera position back to 3D view
      animate(this.camera.position, {
        x: targetPosition.x,
        y: targetPosition.y,
        z: targetPosition.z,
        duration: 800,
        ease: 'inOut(2)',
        onUpdate: () => {
          this.controls.update()
          this._needsUpdate = true
        }
      })

      // Re-enable rotation in 3D mode
      this.controls.noRotate = false
      this.controls.maxPolarAngle = Math.PI / 2
      this.controls.minPolarAngle = 0
    }

    this._needsUpdate = true
  }
}

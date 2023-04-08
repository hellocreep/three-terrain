import * as T from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

export class ThreeTerrain {
  private scene: T.Scene
  private renderer: T.WebGLRenderer
  private camera: T.PerspectiveCamera
  private controls: OrbitControls
  private sunlight?: T.DirectionalLight

  size: { width: number, height: number }
  uBumpScale = 0.00003;

  constructor(canvas: HTMLCanvasElement, size: { width: number, height: number }) {
    const scene = new T.Scene()
    const renderer = new T.WebGLRenderer({
      canvas,
      antialias: true,
      preserveDrawingBuffer: true
    })

    scene.background = new T.Color('white')
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(size.width, size.height)
    renderer.shadowMap.enabled = true

    this.scene = scene
    this.renderer = renderer
    this.size = size

    const camera = new T.PerspectiveCamera(75, size.width / size.height, 0.1, 2000)
    camera.position.x = 1
    camera.position.y = 1
    camera.position.z = 1
    this.camera = camera

    this.scene.add(camera)

    const controls = new OrbitControls(camera, this.renderer.domElement)
    controls.enableDamping = true
    controls.autoRotate = true
    controls.autoRotateSpeed = 0.5
    controls.maxDistance = 2
    controls.minDistance = 0.5
    controls.maxPolarAngle = Math.PI * 0.4
    this.controls = controls
  }

  addTerrain(terrain: HTMLCanvasElement, tiledTerrain: HTMLCanvasElement) {
    const tElevation = new T.CanvasTexture(terrain)
    const tSetellite = new T.CanvasTexture(tiledTerrain)
    const planeGeometry = new T.PlaneGeometry(1, 1, 512, 512)
    const elevation = new T.Mesh(
      planeGeometry,
      new T.ShaderMaterial({
        uniforms: {
          tElevation: { value: tElevation },
          tSetellite: { value: tSetellite },
          uBumpScale: { value: this.uBumpScale }
        },
        vertexShader: `
          uniform sampler2D tElevation;
          uniform float uBumpScale;
          varying vec2 vUv;

          void main () {
            vUv = uv;
            vec3 rgb = texture2D(tElevation, vUv).rgb;
            //see https://docs.mapbox.com/data/tilesets/guides/access-elevation-data/
            float e = -10000.0 + ((rgb.r * 255.0 * 256.0 * 256.0 + rgb.g * 255.0 * 256.0 + rgb.b * 255.0) * 0.1);
            // newPosition move along the normal direction
            vec3 newPosition = position + normal * uBumpScale * e;
            gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );
          }`,
        fragmentShader: `
          uniform sampler2D tElevation;
          uniform sampler2D tSetellite;
          varying vec2 vUv;

          void main () {
            vec3 rgb = texture2D(tElevation, vUv).rgb;
            gl_FragColor = texture2D(tSetellite, vUv);
          }`,
        shadowSide: T.DoubleSide,
        side: T.DoubleSide
        // wireframe: true
      })
    )
    elevation.castShadow = true
    elevation.receiveShadow = true
    elevation.rotation.x = -Math.PI * 0.5

    this.scene.add(elevation)
  }

  addGround() {
    const background = new T.Mesh(
      new T.PlaneGeometry(5, 5),
      new T.MeshStandardMaterial({
        roughness: 0.7,
        metalness: 0.3,
        side: T.DoubleSide
      })
    )
    background.rotation.x = - Math.PI * 0.5
    background.position.y = 0.01
    background.receiveShadow = true
    this.scene.add(background)
  }

  addLight() {
    const sunlight = new T.DirectionalLight(0xffffff, 1)
    sunlight.position.set(-1, 2, 0.5)
    sunlight.shadow.mapSize.width = 1024
    sunlight.shadow.mapSize.height = 1024
    sunlight.shadow.camera.top = 2
    sunlight.shadow.camera.right = 2
    sunlight.shadow.camera.bottom = -0.5
    sunlight.shadow.camera.left = - 2
    sunlight.shadow.camera.near = 1
    sunlight.shadow.camera.far = 6
    sunlight.shadow.radius = 10
    sunlight.castShadow = true
    this.scene.add(sunlight)
    this.sunlight = sunlight
  }

  addHelper() {
    if (!this.sunlight) return

    const directionalLightCameraHelper = new T.CameraHelper(this.sunlight.shadow.camera)
    directionalLightCameraHelper.visible = true
    this.scene.add(directionalLightCameraHelper)
    const helper = new T.DirectionalLightHelper(this.sunlight, 0.2);
    this.scene.add(helper)
  }

  render () {
    this.renderer.render(this.scene, this.camera)
    this.controls.update();

    requestAnimationFrame(() => this.render())
  }

  destroy() {
    this.renderer.dispose()
    this.controls.dispose()
  }
}

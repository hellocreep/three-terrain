'use client'
import { useRef, forwardRef, useImperativeHandle } from 'react'
import { createTiledTerrain } from '../terrain/tiled-terrain'
import { ThreeTerrain } from '../terrain/three-terrain'

export interface TerrainRef {
  createTerrain(center?: mapboxgl.LngLat, zoom?: number): Promise<void>
}

export const Terrain = forwardRef((_, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useImperativeHandle(ref, () => ({
    async createTerrain (center?: mapboxgl.LngLat, zoom?: number) {
      if (!canvasRef.current) return

      const { tiledTerrainImage, terrainImage } = await createTiledTerrain(center, zoom)
      const threeTerrain = new ThreeTerrain(canvasRef.current, {
        width: window.innerWidth,
        height: window.innerHeight
      })
      threeTerrain.addTerrain(terrainImage, tiledTerrainImage)
      threeTerrain.addGround()
      threeTerrain.addLight()
      threeTerrain.render()
    }
  }), [])

  return <canvas ref={canvasRef} />
})

Terrain.displayName = 'Terrain'
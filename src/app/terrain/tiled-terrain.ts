import REGL from 'regl'
import { fetchComprehensiveRegion, lat2tile, long2tile, tile2long } from './utils'
import { processElevation } from './process/elevation'
import { processNormal } from './process/normal'
import { processShadow } from './process/shadow'
import { processAmbient } from './process/ambient'
import { processSatellite } from './process/satellite'

export async function createTiledTerrain(center = { lng: 103.4908, lat: 31.0655 }, zoom = 10) {
  const long = center.lng
  const lat = center.lat
  const tLat = Math.floor(lat2tile(lat, zoom))
  const tLong = Math.floor(long2tile(long, zoom))

  const { terrainImage, satelliteImage } = await fetchComprehensiveRegion(tLat, tLong, zoom)

  const canvas = document.createElement('canvas') as HTMLCanvasElement
  canvas.width = terrainImage.width
  canvas.height = terrainImage.height
  const long0 = tile2long(tLong - 1, zoom);
  const long1 = tile2long(tLong + 2, zoom);
  const pixelScale = (6371000 * (long1 - long0) * 2 * Math.PI) / 360 / terrainImage.width;

  const regl = REGL({ canvas: canvas, extensions: ['OES_texture_float'] })

  const { fboElevation } = processElevation(regl, terrainImage)

  const { fboNormal } = processNormal(regl, fboElevation, terrainImage, pixelScale)

  const { shadowPP } = processShadow(regl, fboElevation, fboNormal, terrainImage, pixelScale)

  const { ambientPP } = processAmbient(regl, fboElevation, fboNormal, terrainImage, pixelScale)

  processSatellite(regl, shadowPP.ping(), ambientPP.ping(), satelliteImage)


  return {
    terrainImage,
    satelliteImage,
    tiledTerrainImage: canvas
  }
}

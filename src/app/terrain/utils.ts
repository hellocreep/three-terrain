import REGL from 'regl'

const regionSize = 2

export function fetchTile(url: string): Promise<HTMLImageElement> {
  return new Promise((accept, error) => {
    const img = new Image()
    img.onload = () => {
      accept(img)
    }
    img.onerror = error
    img.crossOrigin = 'anonymous'
    img.src = url
  })
}

export function long2tile(l: number, zoom: number) {
  return ((l + 180) / 360) * Math.pow(2, zoom)
}

export function lat2tile(l: number, zoom: number) {
  return (
    ((1 - Math.log(Math.tan((l * Math.PI) / 180) + 1 / Math.cos((l * Math.PI) / 180)) / Math.PI) / 2) *
    Math.pow(2, zoom)
  )
}

export function tile2long(x: number, z: number) {
  return (x / Math.pow(2, z)) * 360 - 180
}

export function PingPong(regl: REGL.Regl, opts: REGL.FramebufferOptions) {
  const fbos = [regl.framebuffer(opts), regl.framebuffer(opts)]

  let index = 0

  function ping() {
    return fbos[index]
  }

  function pong() {
    return fbos[1 - index]
  }

  function swap() {
    index = 1 - index
  }

  return {
    ping,
    pong,
    swap
  }
}

export async function fetchRegion(tLat: number, tLong: number, zoom: number, url: string) {
  const canvas = document.createElement('canvas')
  canvas.width = regionSize * 256
  canvas.height = regionSize * 256
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
  for (let x = 0; x < regionSize; x++) {
    const _tLong = tLong + (x - 1)
    for (let y = 0; y < regionSize; y++) {
      const _tLat = tLat + (y - 1)
      const _url = url
        .replace('zoom', zoom.toString())
        .replace('tLat', _tLat.toString())
        .replace('tLong', _tLong.toString())
      const img = await fetchTile(_url)
      ctx.drawImage(img, x * 256, y * 256)
    }
  }
  return canvas
}

export async function fetchComprehensiveRegion (tLat: number, tLong: number, zoom: number) {
  const terrainImage = await fetchRegion(
    tLat,
    tLong,
    zoom,
    `https://api.mapbox.com/v4/mapbox.terrain-rgb/zoom/tLong/tLat.pngraw?access_token=${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN as string}`
  )

  const satelliteImage = await fetchRegion(
    tLat,
    tLong,
    zoom,
    `https://api.mapbox.com/v4/mapbox.satellite/zoom/tLong/tLat.pngraw?access_token=${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN as string}`
  )

  return {
    terrainImage,
    satelliteImage
  }
}
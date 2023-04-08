import REGL from 'regl'

export function processElevation(regl: REGL.Regl, terrainImage: HTMLCanvasElement) {
  const tElevation = regl.texture({
    data: terrainImage,
    flipY: true
  })

  const fboElevation = regl.framebuffer({
    width: terrainImage.width,
    height: terrainImage.height,
    colorType: 'float'
  })

  regl({
    vert: `
      precision highp float;
      attribute vec2 position;

      void main() {
        gl_Position = vec4(position, 0, 1);
      }
    `,
    frag: `
      precision highp float;

      uniform sampler2D tElevation;
      uniform vec2 resolution;
      uniform float elevationScale;

      void main() {
        // Sample the terrain-rgb tile.
        vec3 rgb = texture2D(tElevation, gl_FragCoord.xy/resolution).rgb;

        // Convert the red, green, and blue channels into an elevation.
        float e = -10000.0 + ((rgb.r * 255.0 * 256.0 * 256.0 + rgb.g * 255.0 * 256.0 + rgb.b * 255.0) * 0.1);

        // Scale the elevation and write it out.
        gl_FragColor = vec4(vec3(e * elevationScale), 1.0);
      }
    `,
    attributes: {
      position: [-1, -1, 1, -1, 1, 1, -1, -1, 1, 1, -1, 1]
    },
    uniforms: {
      tElevation: tElevation,
      elevationScale: 4.0,
      resolution: [terrainImage.width, terrainImage.height]
    },
    viewport: { x: 0, y: 0, width: terrainImage.width, height: terrainImage.height },
    framebuffer: fboElevation,
    count: 6
  })()

  return {
    tElevation,
    fboElevation,
  }
}

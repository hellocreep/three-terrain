import REGL from 'regl'


export function processNormal(
  regl: REGL.Regl,
  fboElevation: REGL.Framebuffer2D,
  terrainImage: HTMLCanvasElement,
  pixelScale: number
) {
  const fboNormal = regl.framebuffer({
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
      uniform float pixelScale;

      void main() {
        vec2 dr = 1.0/resolution;
        float p0 = texture2D(tElevation, dr * (gl_FragCoord.xy + vec2(0.0, 0.0))).r;
        float px = texture2D(tElevation, dr * (gl_FragCoord.xy + vec2(1.0, 0.0))).r;
        float py = texture2D(tElevation, dr * (gl_FragCoord.xy + vec2(0.0, 1.0))).r;
        vec3 dx = vec3(pixelScale, 0.0, px - p0);
        vec3 dy = vec3(0.0, pixelScale, py - p0);
        vec3 n = normalize(cross(dx, dy));
        gl_FragColor = vec4(n, 1.0);
      }
    `,
    attributes: {
      position: [-1, -1, 1, -1, 1, 1, -1, -1, 1, 1, -1, 1]
    },
    uniforms: {
      tElevation: fboElevation,
      pixelScale: pixelScale,
      resolution: [terrainImage.width, terrainImage.height]
    },
    viewport: { x: 0, y: 0, width: terrainImage.width, height: terrainImage.height },
    framebuffer: fboNormal,
    count: 6
  })()

  return {
    fboNormal,
  }
}

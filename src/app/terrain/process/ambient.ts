import { vec3 } from 'gl-matrix'
import REGL from 'regl'
import { PingPong } from '../utils'

export function processAmbient(
  regl: REGL.Regl,
  fboElevation: REGL.Framebuffer2D,
  fboNormal: REGL.Framebuffer2D,
  terrainImage: HTMLCanvasElement,
  pixelScale: number
) {
  const ambientPP = PingPong(regl, {
    width: terrainImage.width,
    height: terrainImage.height,
    colorType: 'float'
  })
  const renderAmbient = regl({
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
      uniform sampler2D tNormal;
      uniform sampler2D tSrc;
      uniform vec3 direction;
      uniform vec2 resolution;
      uniform float pixelScale;

      void main() {
        vec2 ires = 1.0 / resolution;
        vec3 src = texture2D(tSrc, gl_FragCoord.xy * ires).rgb;
        vec4 e0 = texture2D(tElevation, gl_FragCoord.xy * ires);
        vec3 n0 = texture2D(tNormal, gl_FragCoord.xy * ires).rgb;
        vec3 sr3d = normalize(n0 + direction);
        vec2 sr = normalize(sr3d.xy);
        vec2 p0 = gl_FragCoord.xy;
        vec2 p = floor(p0);
        vec2 stp = sign(sr);
        vec2 tMax = step(0.0, sr) * (1.0 - fract(p0)) + (1.0 - step(0.0, sr)) * fract(p0);
        tMax /= abs(sr);
        vec2 tDelta = 1.0 / abs(sr);
        for (int i = 0; i < 65536; i++) {
          if (tMax.x < tMax.y) {
            tMax.x += tDelta.x;
            p.x += stp.x;
          } else {
            tMax.y += tDelta.y;
            p.y += stp.y;
          }
          vec2 ptex = ires * (p + 0.5);
          if (ptex.x < 0.0 || ptex.x > 1.0 || ptex.y < 0.0 || ptex.y > 1.0) {
            gl_FragColor = vec4(src + vec3(1.0/128.0), 1.0);
            return;
          }
          vec4 e = texture2D(tElevation, ptex);
          float t = distance(p + 0.5, p0);
          float z = e0.r + t * pixelScale * sr3d.z;
          if (e.r > z) {
            gl_FragColor = vec4(src, 1.0);
            return;
          }
        }
        gl_FragColor = vec4(src + vec3(1.0/128.0), 1.0);
      }
    `,
    depth: {
      enable: false
    },
    attributes: {
      position: [-1, -1, 1, -1, 1, 1, -1, -1, 1, 1, -1, 1]
    },
    uniforms: {
      tElevation: fboElevation,
      tNormal: fboNormal,
      tSrc: regl.prop<any, any>('src'),
      direction: regl.prop<any, any>('direction'),
      pixelScale: pixelScale,
      resolution: [terrainImage.width, terrainImage.height]
    },
    viewport: { x: 0, y: 0, width: terrainImage.width, height: terrainImage.height },
    framebuffer: regl.prop<any, any>('dest'),
    count: 6
  })

  for (let i = 0; i < 128; i++) {
    renderAmbient({
      direction: vec3.random(vec3.create(), Math.random()),
      src: ambientPP.ping(),
      dest: ambientPP.pong()
    })
    ambientPP.swap()
  }

  return {
    ambientPP
  }
}

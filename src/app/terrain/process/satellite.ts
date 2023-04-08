import REGL from 'regl'

export function processSatellite(
  regl: REGL.Regl,
  tSoftShadow: REGL.Framebuffer2D,
  tAmbient: REGL.Framebuffer2D,
  satelliteImage: HTMLCanvasElement
) {
  const tSatellite = regl.texture({
    data: satelliteImage,
    flipY: true
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

      uniform sampler2D tSoftShadow;
      uniform sampler2D tAmbient;
      uniform sampler2D tSatellite;
      uniform vec2 resolution;

      void main() {
        vec2 ires = 1.0 / resolution;
        float softShadow = texture2D(tSoftShadow, ires * gl_FragCoord.xy).r;
        float ambient = texture2D(tAmbient, ires * gl_FragCoord.xy).r;
        vec3 satellite = texture2D(tSatellite, ires * gl_FragCoord.xy).rgb;
        float l = 4.0 * softShadow + 0.25 * ambient;
        vec3 color = l * pow(satellite, vec3(2.0));
        color = pow(color, vec3(1.0/2.2));
        gl_FragColor = vec4(color, 1.0);
      }
    `,
    depth: {
      enable: false
    },
    attributes: {
      position: [-1, -1, 1, -1, 1, 1, -1, -1, 1, 1, -1, 1]
    },
    uniforms: {
      tSoftShadow: tSoftShadow,
      tAmbient: tAmbient,
      tSatellite: tSatellite,
      resolution: [satelliteImage.width, satelliteImage.height]
    },
    viewport: { x: 0, y: 0, width: satelliteImage.width, height: satelliteImage.height },
    count: 6
  })()
}

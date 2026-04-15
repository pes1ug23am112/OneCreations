"use client";

import { useEffect, useRef } from "react";

type Uniforms = Record<string, WebGLUniformLocation | null>;

export function ShaderAnimation() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvasEl = canvasRef.current;
    if (!canvasEl) return;

    let uniforms: Uniforms = {};
    let rafId = 0;

    const vsSource = `
      precision mediump float;
      varying vec2 vUv;
      attribute vec2 a_position;
      void main() {
        vUv = 0.5 * (a_position + 1.0);
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    const fsSource = `
      precision highp float;
      varying vec2 vUv;
      uniform float u_time;
      uniform vec2 u_resolution;

      const vec3 PURPLE = vec3(0.541, 0.227, 0.929);
      const vec3 DEEP   = vec3(0.102, 0.055, 0.231);
      const vec3 WHITE  = vec3(1.0);
      const vec3 BLACK  = vec3(0.0);

      mat2 rot(float a) { return mat2(cos(a), -sin(a), sin(a), cos(a)); }

      float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
      float noise(vec2 p) {
        vec2 i = floor(p); vec2 f = fract(p);
        float a = hash(i), b = hash(i + vec2(1.0, 0.0));
        float c = hash(i + vec2(0.0, 1.0)), d = hash(i + vec2(1.0, 1.0));
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
      }
      float fbm(vec2 p) {
        float v = 0.0; float a = 0.5;
        for (int i = 0; i < 5; i++) {
          v += a * noise(p);
          p = rot(0.5) * p * 2.0;
          a *= 0.5;
        }
        return v;
      }

      void main() {
        vec2 uv = (vUv - 0.5) * vec2(u_resolution.x / u_resolution.y, 1.0);
        float t = u_time * 0.00008;

        vec2 q = vec2(fbm(uv * 1.2 + t), fbm(uv * 1.2 - t + 3.7));
        vec2 r = vec2(
          fbm(uv * 1.6 + q * 1.8 + vec2(1.7, 9.2) + t * 1.3),
          fbm(uv * 1.6 + q * 1.8 + vec2(8.3, 2.8) - t * 1.1)
        );
        float f = fbm(uv * 2.0 + r);

        vec3 col = mix(BLACK, DEEP, clamp(f * 1.4, 0.0, 1.0));
        col = mix(col, PURPLE, clamp(length(r) * 0.9, 0.0, 1.0));
        col = mix(col, WHITE, pow(clamp(f * f * 1.8 - 0.55, 0.0, 1.0), 2.0));

        // vignette keeps focus off edges
        float v = smoothstep(1.3, 0.25, length(uv));
        col *= 0.45 + 0.55 * v;

        gl_FragColor = vec4(col, 1.0);
      }
    `;

    const gl = (canvasEl.getContext("webgl") ||
      canvasEl.getContext("experimental-webgl")) as WebGLRenderingContext | null;
    if (!gl) return;

    const createShader = (source: string, type: number) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vs = createShader(vsSource, gl.VERTEX_SHADER);
    const fs = createShader(fsSource, gl.FRAGMENT_SHADER);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;

    const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < count; i++) {
      const info = gl.getActiveUniform(program, i);
      if (!info) continue;
      uniforms[info.name] = gl.getUniformLocation(program, info.name);
    }

    const vertices = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    gl.useProgram(program);
    const posLoc = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 2);
      const w = canvasEl.clientWidth;
      const h = canvasEl.clientHeight;
      canvasEl.width = w * dpr;
      canvasEl.height = h * dpr;
      if (uniforms.u_resolution) {
        gl.uniform2f(uniforms.u_resolution, canvasEl.width, canvasEl.height);
      }
      gl.viewport(0, 0, canvasEl.width, canvasEl.height);
    };
    resize();
    window.addEventListener("resize", resize);

    const render = () => {
      gl.uniform1f(uniforms.u_time!, performance.now());
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      rafId = requestAnimationFrame(render);
    };
    render();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        display: "block",
        pointerEvents: "none",
      }}
    />
  );
}

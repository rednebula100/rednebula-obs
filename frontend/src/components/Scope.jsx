import { useRef, useEffect, useState } from 'react'
import '../styles/celestial-body.css'

// ─── Shader source (verbatim from design reference) ────────────────────────

const SCOPE_VERT = `
attribute vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`

const SCOPE_FRAG = `
precision highp float;
uniform vec2  u_res;
uniform float u_time;
uniform float u_seed;
uniform float u_kind;
uniform vec3  u_accent;
uniform float u_lock;
uniform float u_mode;     // 0 VIS · 1 IR · 2 RADIO · 3 SPECTRAL · 4 XRAY
uniform float u_glitch;   // 0..1

float hash31(vec3 p){
  p = fract(p * vec3(123.34, 234.34, 345.65));
  p += dot(p, p + 34.45);
  return fract(p.x * p.y * p.z);
}
float hash21(vec2 p){
  p = fract(p * vec2(123.34, 234.34));
  p += dot(p, p + 34.45);
  return fract(p.x * p.y);
}
float noise(vec3 p){
  vec3 i = floor(p), f = fract(p);
  f = f*f*(3.0-2.0*f);
  float n000 = hash31(i),
        n100 = hash31(i+vec3(1,0,0)),
        n010 = hash31(i+vec3(0,1,0)),
        n110 = hash31(i+vec3(1,1,0)),
        n001 = hash31(i+vec3(0,0,1)),
        n101 = hash31(i+vec3(1,0,1)),
        n011 = hash31(i+vec3(0,1,1)),
        n111 = hash31(i+vec3(1,1,1));
  return mix(
    mix(mix(n000,n100,f.x), mix(n010,n110,f.x), f.y),
    mix(mix(n001,n101,f.x), mix(n011,n111,f.x), f.y),
    f.z);
}
float fbm(vec3 p){
  float s = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++){
    s += a * noise(p);
    p *= 2.07;
    a *= 0.5;
  }
  return s;
}
mat3 rotY(float a){ return mat3(cos(a),0.,sin(a), 0.,1.,0., -sin(a),0.,cos(a)); }
mat3 rotX(float a){ return mat3(1.,0.,0., 0.,cos(a),-sin(a), 0.,sin(a),cos(a)); }

vec3 visibleColor(float kind, float field) {
  vec3 c1, c2, c3;
  if (kind < 0.5){       c1 = vec3(0.14, 0.05, 0.05); c2 = vec3(0.62, 0.18, 0.18); c3 = vec3(0.95, 0.52, 0.38); }
  else if (kind < 1.5){  c1 = vec3(0.04, 0.10, 0.14); c2 = vec3(0.18, 0.42, 0.55); c3 = vec3(0.62, 0.86, 0.95); }
  else if (kind < 2.5){  c1 = vec3(0.08, 0.08, 0.10); c2 = vec3(0.38, 0.36, 0.34); c3 = vec3(0.88, 0.84, 0.76); }
  else {                 c1 = vec3(0.10, 0.08, 0.04); c2 = vec3(0.46, 0.32, 0.13); c3 = vec3(0.96, 0.78, 0.42); }
  vec3 col = mix(c1, c2, smoothstep(0.25, 0.65, field));
  col = mix(col, c3, smoothstep(0.62, 0.88, field));
  return col;
}
vec3 irColor(float field) {
  vec3 a = vec3(0.10, 0.04, 0.20);
  vec3 b = vec3(0.70, 0.22, 0.12);
  vec3 c = vec3(0.98, 0.85, 0.55);
  vec3 d = vec3(1.00, 1.00, 0.90);
  vec3 col = mix(a, b, smoothstep(0.10, 0.45, field));
  col = mix(col, c, smoothstep(0.45, 0.78, field));
  col = mix(col, d, smoothstep(0.80, 1.0, field));
  return col;
}
vec3 radioColor(float field) {
  float t = field * 0.65;
  float bands = sin(field * 26.0) * 0.5 + 0.5;
  bands = pow(bands, 6.0);
  vec3 base = mix(vec3(0.03, 0.07, 0.10), vec3(0.45, 0.85, 0.95), t);
  return base + bands * vec3(0.5, 0.85, 0.95) * 0.55;
}
vec3 spectralColor(float field, vec2 fc) {
  vec3 base = mix(vec3(0.18, 0.18, 0.18), vec3(0.85, 0.80, 0.70), pow(field, 0.7));
  float lines = sin(fc.x * 0.36 + field * 4.0) * 0.5 + 0.5;
  lines = pow(lines, 24.0);
  return mix(base, vec3(0.05, 0.04, 0.03), lines * 0.85);
}
vec3 xrayColor(float field) {
  float t = pow(field, 1.55);
  vec3 base = mix(vec3(0.02, 0.05, 0.03), vec3(0.62, 0.95, 0.72), t);
  return base + smoothstep(0.85, 1.0, field) * vec3(0.6, 1.0, 0.7) * 0.4;
}

vec3 surfaceColor(int mode, float kind, float field, vec2 fc) {
  if (mode == 1) return irColor(field);
  if (mode == 2) return radioColor(field);
  if (mode == 3) return spectralColor(field, fc);
  if (mode == 4) return xrayColor(field);
  return visibleColor(kind, field);
}

vec3 modeAccent(int mode, vec3 accent) {
  if (mode == 1) return vec3(0.95, 0.55, 0.30);
  if (mode == 2) return vec3(0.45, 0.85, 0.95);
  if (mode == 3) return vec3(0.80, 0.78, 0.65);
  if (mode == 4) return vec3(0.65, 0.95, 0.72);
  return accent;
}

void main(){
  vec2 fragCo = gl_FragCoord.xy;

  float glAmt = u_glitch;
  if (glAmt > 0.001) {
    float band = floor(fragCo.y * 0.06 + u_time * 24.0);
    float bs = hash21(vec2(band, 7.0)) - 0.5;
    fragCo.x += bs * 60.0 * glAmt;
    float skip = step(0.85, hash21(vec2(band, 13.0)));
    fragCo.y += skip * glAmt * 8.0;
  }

  vec2 uv = (fragCo - 0.5*u_res) / min(u_res.x, u_res.y);
  uv *= 2.2;
  float r2 = dot(uv, uv);

  int mode = int(u_mode + 0.5);
  vec3 accentMode = modeAccent(mode, u_accent);

  vec3 col = vec3(0.018, 0.022, 0.030);
  vec2 st = floor(uv * 110.0);
  float sh = hash31(vec3(st, 7.0));
  if (sh > 0.9965) col += vec3(0.55, 0.55, 0.5) * (sh - 0.9965) * 280.0;
  if (sh > 0.9920 && sh < 0.9965) col += vec3(0.18);

  if (r2 < 1.0) {
    float z = sqrt(1.0 - r2);
    vec3 n = vec3(uv, z);
    float a = u_time * 0.07 + u_seed * 6.2831;
    float tilt = (u_seed - 0.5) * 0.6;
    vec3 q = rotY(a) * rotX(tilt) * n;
    float v = fbm(q * (2.2 + u_seed * 1.6) + u_seed * 13.0);
    float w = fbm(q * 5.0 + v * 1.8 + 4.0);
    float band = sin(q.y * (3.0 + u_seed*4.0) + w*1.4) * 0.5 + 0.5;
    float field = mix(v, band, 0.35);

    vec3 surf = surfaceColor(mode, u_kind, field, fragCo);

    float spot = smoothstep(0.78, 0.95, fbm(q * 8.0 + 17.0 + u_seed * 7.0));
    surf += spot * accentMode * (mode == 0 ? 0.0 : 0.18);

    vec3 L = normalize(vec3(0.55, 0.45, 0.78));
    float lam = max(0.0, dot(n, L));
    float light = pow(lam, 0.85) * 0.75 + 0.25;
    surf *= light;
    surf *= smoothstep(-0.18, 0.18, dot(n, L));

    float rim = pow(1.0 - z, 2.5);
    surf += rim * accentMode * 0.40;

    col = surf;
  }

  float r = sqrt(r2);
  float halo = (1.0 - smoothstep(0.95, 1.45, r)) * smoothstep(0.95, 1.05, r);
  col += halo * mix(accentMode, u_accent, 0.35) * 0.6;

  float lockR = 0.4 + u_lock * 1.6;
  float lockBand = smoothstep(0.04, 0.0, abs(r - lockR)) * (1.0 - u_lock);
  col += lockBand * accentMode * 0.9;

  if (mode == 2) {
    float sweep = smoothstep(0.0, 0.04, abs(fract(u_time*0.13) - (fragCo.y/u_res.y)));
    col += (1.0 - sweep) * accentMode * 0.08;
  }
  if (mode == 3) {
    float gx = step(0.98, fract(fragCo.x * 0.018));
    col += gx * accentMode * 0.08;
  }
  if (mode == 4) {
    col *= 1.0 + 0.10 * sin(fragCo.y * 1.6);
  }

  col *= 0.94 + 0.06 * sin(fragCo.y * 3.1415);

  if (glAmt > 0.001) {
    float nz = hash21(fragCo + u_time*60.0);
    col += (nz - 0.5) * 0.6 * glAmt;
    col = mix(col, col.gbr, glAmt * 0.6);
  }

  col *= 1.0 - smoothstep(0.7, 1.6, r) * 0.6;

  gl_FragColor = vec4(col, 1.0);
}
`

// ─── WebGL helpers ──────────────────────────────────────────────────────────

function compile(gl, type, src) {
  const sh = gl.createShader(type)
  gl.shaderSource(sh, src)
  gl.compileShader(sh)
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(sh))
    return null
  }
  return sh
}
function makeProgram(gl) {
  const v = compile(gl, gl.VERTEX_SHADER, SCOPE_VERT)
  const f = compile(gl, gl.FRAGMENT_SHADER, SCOPE_FRAG)
  if (!v || !f) return null
  const p = gl.createProgram()
  gl.attachShader(p, v); gl.attachShader(p, f)
  gl.linkProgram(p)
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(p))
    return null
  }
  return p
}
function hexToRGB(hex) {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex || '#d97070')
  if (!m) return [0.85, 0.44, 0.44]
  return [parseInt(m[1], 16) / 255, parseInt(m[2], 16) / 255, parseInt(m[3], 16) / 255]
}

const KIND_OF = { GAME: 0, WEB: 1, LIB: 2, TOOL: 3 }

// Filter type → observation mode. Exported so ProjectSection can read the label.
export const FILTER_MODES = {
  ALL:  { idx: 0, name: 'VISIBLE',  ch: 'TRUE COLOR',          wav: '380–780 nm',  key: 'vis' },
  GAME: { idx: 1, name: 'INFRARED', ch: 'THERMAL · IR',         wav: '10–1000 µm',  key: 'ir' },
  WEB:  { idx: 2, name: 'RADIO',    ch: 'CONTINUUM · 1.4 GHz',  wav: '21 cm',       key: 'radio' },
  LIB:  { idx: 3, name: 'SPECTRAL', ch: 'ABSORPTION · Hα',      wav: '656.3 nm',    key: 'spectral' },
  TOOL: { idx: 4, name: 'X-RAY',    ch: 'HARD · 0.1–10 keV',    wav: '0.1–10 keV',  key: 'xray' },
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function Scope({ project, accent, mode = 'ALL', glitch = false, dossierMode = false, onOpenDossier }) {
  const canvasRef  = useRef(null)
  const targetRef  = useRef({ seed: project?.seed ?? 0.5, kind: KIND_OF[project?.type] ?? 0, lockStart: 0, modeIdx: 0, glitch: 0 })
  const currentRef = useRef({ seed: project?.seed ?? 0.5, kind: KIND_OF[project?.type] ?? 0, modeIdx: 0, glitch: 0 })
  const accentRef  = useRef(hexToRGB(accent))
  const [hud, setHud] = useState({ az: 124.5, el: 51.2 })

  useEffect(() => {
    if (!project) return
    targetRef.current.seed = project.seed
    targetRef.current.kind = KIND_OF[project.type] ?? 0
    targetRef.current.lockStart = performance.now()
  }, [project])

  useEffect(() => { accentRef.current = hexToRGB(accent) }, [accent])

  useEffect(() => {
    targetRef.current.modeIdx = (FILTER_MODES[mode] || FILTER_MODES.ALL).idx
    targetRef.current.lockStart = performance.now()
  }, [mode])

  useEffect(() => {
    targetRef.current.glitch = glitch ? 1 : 0
  }, [glitch])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const gl = canvas.getContext('webgl', { antialias: true, premultipliedAlpha: false, alpha: false })
    if (!gl) {
      canvas.style.background = 'radial-gradient(circle at 50% 50%, #4a1c1c 0%, #06070a 60%)'
      return
    }
    const prog = makeProgram(gl)
    if (!prog) return

    const quad = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, quad)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]), gl.STATIC_DRAW)
    const loc_pos = gl.getAttribLocation(prog, 'a_pos')
    gl.enableVertexAttribArray(loc_pos)
    gl.vertexAttribPointer(loc_pos, 2, gl.FLOAT, false, 0, 0)

    const u_res    = gl.getUniformLocation(prog, 'u_res')
    const u_time   = gl.getUniformLocation(prog, 'u_time')
    const u_seed   = gl.getUniformLocation(prog, 'u_seed')
    const u_kind   = gl.getUniformLocation(prog, 'u_kind')
    const u_accent = gl.getUniformLocation(prog, 'u_accent')
    const u_lock   = gl.getUniformLocation(prog, 'u_lock')
    const u_mode   = gl.getUniformLocation(prog, 'u_mode')
    const u_glitch = gl.getUniformLocation(prog, 'u_glitch')
    gl.useProgram(prog)

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const w = canvas.clientWidth * dpr
      const h = canvas.clientHeight * dpr
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w; canvas.height = h
        gl.viewport(0, 0, w, h)
      }
    }

    const t0 = performance.now()
    let raf
    const tick = () => {
      resize()
      const now = performance.now()
      const tt = (now - t0) / 1000
      const cur = currentRef.current
      const tar = targetRef.current
      let dS = tar.seed - cur.seed
      if (dS > 0.5) dS -= 1; else if (dS < -0.5) dS += 1
      cur.seed = (cur.seed + dS * 0.08 + 1) % 1
      cur.kind    = cur.kind    + (tar.kind    - cur.kind)    * 0.12
      cur.modeIdx = cur.modeIdx + (tar.modeIdx - cur.modeIdx) * 0.18
      cur.glitch  = cur.glitch  + (tar.glitch  - cur.glitch)  * 0.22

      const lockMs = now - tar.lockStart
      const lock = Math.max(0, 1 - lockMs / 700)

      gl.uniform2f(u_res, canvas.width, canvas.height)
      gl.uniform1f(u_time, tt)
      gl.uniform1f(u_seed, cur.seed)
      gl.uniform1f(u_kind, cur.kind)
      const a = accentRef.current
      gl.uniform3f(u_accent, a[0], a[1], a[2])
      gl.uniform1f(u_lock, lock)
      gl.uniform1f(u_mode, cur.modeIdx)
      gl.uniform1f(u_glitch, cur.glitch)
      gl.drawArrays(gl.TRIANGLES, 0, 6)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  function onMove(e) {
    const r = e.currentTarget.getBoundingClientRect()
    const cx = (e.clientX - r.left) / r.width
    const cy = (e.clientY - r.top) / r.height
    setHud({
      az: (124.5 + (cx - 0.5) * 35).toFixed(1),
      el: (51.2  - (cy - 0.5) * 35).toFixed(1),
    })
  }

  const p = project
  const m = FILTER_MODES[mode] || FILTER_MODES.ALL

  return (
    <div className={'scope' + (glitch ? ' glitching' : '')} data-mode={m.key}>
      {!dossierMode && (
        <div className="mode-strip">
          <span className="k">MODE</span>
          <span className="mode-name"><span className="glyph" />{m.name}</span>
          <span className="channel">CH · <b>{m.ch}</b></span>
          <span className="reading">EXP <b>30s</b> · GAIN <b>+12dB</b></span>
        </div>
      )}

      <div className="scope-hd">
        <span><span className="pulse" />SCOPE · <b>{p?.id ?? '—'}</b></span>
        <span>{p?.ra ?? '—'} · {p?.dec ?? '—'}</span>
      </div>

      <div className="scope-view" onMouseMove={onMove}>
        <canvas ref={canvasRef} />
        <div className="scope-ret" aria-hidden="true">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none">
            <circle cx="50" cy="50" r="48" fill="none" stroke="rgba(217,112,112,.35)" strokeWidth=".18"/>
            <circle cx="50" cy="50" r="34" fill="none" stroke="rgba(217,112,112,.20)" strokeWidth=".12" strokeDasharray=".8 1.6"/>
            <circle cx="50" cy="50" r="18" fill="none" stroke="rgba(217,112,112,.18)" strokeWidth=".10"/>
            <line x1="50" y1="2"  x2="50" y2="12" stroke="rgba(217,112,112,.55)" strokeWidth=".2"/>
            <line x1="50" y1="88" x2="50" y2="98" stroke="rgba(217,112,112,.55)" strokeWidth=".2"/>
            <line x1="2"  y1="50" x2="12" y2="50" stroke="rgba(217,112,112,.55)" strokeWidth=".2"/>
            <line x1="88" y1="50" x2="98" y2="50" stroke="rgba(217,112,112,.55)" strokeWidth=".2"/>
            {Array.from({ length: 36 }).map((_, i) => {
              const ang = i * (Math.PI * 2 / 36)
              const x1 = 50 + Math.cos(ang) * 46.5, y1 = 50 + Math.sin(ang) * 46.5
              const r2 = (i % 9 === 0) ? 43 : 45.2
              const x2 = 50 + Math.cos(ang) * r2,   y2 = 50 + Math.sin(ang) * r2
              return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
                           stroke={i%9===0 ? 'rgba(217,112,112,.7)' : 'rgba(217,112,112,.3)'}
                           strokeWidth={i%9===0 ? '.25' : '.12'} />
            })}
            <circle cx="50" cy="50" r=".5" fill="rgba(217,112,112,.8)"/>
          </svg>
          {p && <div className="lock"><span className="d"/>FOCUS · LOCKED<span className="d"/></div>}
          <div className="corner c-tl">EXP <b>30s</b><br/>ISO <b>1600</b></div>
          <div className="corner c-tr">FK5 · <b>2192</b><br/>FOV 1.8°</div>
          <div className="corner c-bl live">AZ <b>{hud.az}°</b><br/>EL <b>{hud.el}°</b></div>
          <div className="corner c-br">TRACK <b>+</b><br/>SEEING 2.1″</div>
        </div>
      </div>

      <div className="scope-meta">
        {p ? (
          <>
            <div className="row1">
              <span className="id">{p.id} · {p.type}</span>
              <span className="mag">MAG <b>{p.mag.toFixed(1)}</b> · {p.year} · {p.statusLabel}</span>
            </div>
            <div className="nm">{p.name}</div>
            <div className="sub">{p.sub}</div>
            <div className="stk">{p.stack.map(s => <span key={s} className="chip">{s}</span>)}</div>
            <div className="stats">
              <div><span className="k">CLASS</span><span className="v">{p.type}</span></div>
              <div><span className="k">MAG</span><span className="v">{p.mag.toFixed(1)}</span></div>
              <div><span className="k">YEAR</span><span className="v">{p.year}</span></div>
              <div><span className="k">STATUS</span><span className="v">{p.statusLabel}</span></div>
            </div>
            {!dossierMode && onOpenDossier && (
              <button className="btn primary" style={{ justifyContent: 'center' }} onClick={() => onOpenDossier(p)}>
                ⸢ OPEN OBSERVATION RECORD <span className="k">[↵]</span>
              </button>
            )}
          </>
        ) : (
          <div className="scope-no-target">
            <span>◎</span>
            <span>NO TARGET SELECTED</span>
            <span className="hint">HOVER A RECORD TO ACQUIRE</span>
          </div>
        )}
      </div>
    </div>
  )
}

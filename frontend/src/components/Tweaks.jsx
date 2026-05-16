import { useState, useRef, useCallback } from 'react'
import '../styles/tweaks.css'

const ACCENTS = [
  { hex: '#d97070', bright: '#e88585', dim: '#8c4a4a' },
  { hex: '#d99a55', bright: '#e6b06d', dim: '#8c6a3a' },
  { hex: '#6fb4c9', bright: '#90cbdd', dim: '#3f7080' },
  { hex: '#7fb088', bright: '#9bc6a3', dim: '#4c6b53' },
  { hex: '#c8c5bb', bright: '#e2dfd4', dim: '#6a6862' },
]

export default function Tweaks({ open, onClose, accent, onAccent }) {
  const [density, setDensity] = useState('regular')
  const [font,    setFont]    = useState('mono')
  const [stars,   setStars]   = useState(false)
  const panelRef = useRef(null)
  const dragRef  = useRef(null)

  const applyAccent = (a) => {
    document.documentElement.style.setProperty('--accent',   a.hex)
    document.documentElement.style.setProperty('--accent-b', a.bright)
    document.documentElement.style.setProperty('--accent-d', a.dim)
    onAccent(a.hex)
  }

  const applyDensity = (d) => { setDensity(d); document.body.setAttribute('data-density', d) }
  const applyFont    = (f) => { setFont(f); document.documentElement.style.setProperty('--face', f === 'sans' ? 'var(--sans)' : 'var(--mono)') }

  const onDragStart = useCallback((e) => {
    const panel = panelRef.current
    if (!panel) return
    const rect = panel.getBoundingClientRect()
    dragRef.current = { ox: e.clientX - rect.left, oy: e.clientY - rect.top }
    panel.style.transition = 'none'
    const onMove = (e) => {
      panel.style.right = 'auto'; panel.style.bottom = 'auto'
      panel.style.left = `${e.clientX - dragRef.current.ox}px`
      panel.style.top  = `${e.clientY - dragRef.current.oy}px`
    }
    const onUp = () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }, [])

  if (!open) return null

  return (
    <div className="tweaks" ref={panelRef}>
      <div className="tweaks-hd" onMouseDown={onDragStart}>
        <span className="tweaks-hd-label">⌘ TWEAKS</span>
        <span className="tweaks-hd-close" onClick={onClose}>×</span>
      </div>
      <div className="tweaks-body">
        <div>
          <div className="tweak-group-label">ACCENT COLOUR</div>
          <div className="tweak-swatches">
            {ACCENTS.map(a => (
              <div key={a.hex} className={`tweak-swatch ${accent === a.hex ? 'active' : ''}`}
                style={{ background: a.hex }} onClick={() => applyAccent(a)} />
            ))}
          </div>
        </div>
        <div>
          <div className="tweak-group-label">FONT FACE</div>
          <div className="tweak-pills">
            {['mono', 'sans'].map(f => (
              <button key={f} className={`tweak-pill ${font === f ? 'active' : ''}`} onClick={() => applyFont(f)}>{f}</button>
            ))}
          </div>
        </div>
        <div>
          <div className="tweak-group-label">DENSITY</div>
          <div className="tweak-pills">
            {['compact', 'regular', 'comfy'].map(d => (
              <button key={d} className={`tweak-pill ${density === d ? 'active' : ''}`} onClick={() => applyDensity(d)}>{d}</button>
            ))}
          </div>
        </div>
        <div>
          <div className="tweak-group-label">BACKGROUND</div>
          <div className="tweak-row">
            <span className="tweak-label">Starfield</span>
            <div className={`tweak-toggle ${stars ? 'on' : ''}`} onClick={() => setStars(s => !s)} />
          </div>
        </div>
        <div style={{ paddingTop: 8, borderTop: '1px solid rgba(0,0,0,0.1)' }}>
          <div className="tweak-group-label">BUILD</div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'rgba(0,0,0,0.45)', lineHeight: 1.5 }}>
            RED NEBULA v0.1.0<br />Vite + React 18 · Plain CSS<br />WebGL · No external deps
          </div>
        </div>
      </div>
    </div>
  )
}

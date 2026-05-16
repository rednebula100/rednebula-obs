import { useState, useEffect, useRef } from 'react'
import '../styles/hero.css'

const CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/\\|!@#$%'

function useScramble(target, delay = 0) {
  const [text, setText] = useState('')
  const raf = useRef(null)
  useEffect(() => {
    let frame = 0
    const maxFrames = target.length * 3
    const tick = () => {
      frame++
      setText(target.split('').map((ch, i) => {
        if (ch === ' ') return ' '
        if (frame >= (i + 1) * 3) return ch
        return CHARSET[Math.floor(Math.random() * CHARSET.length)]
      }).join(''))
      if (frame < maxFrames) raf.current = requestAnimationFrame(tick)
    }
    const tid = setTimeout(() => { raf.current = requestAnimationFrame(tick) }, delay)
    return () => { clearTimeout(tid); if (raf.current) cancelAnimationFrame(raf.current) }
  }, [target, delay])
  return text
}

const META = [
  { key: 'OPERATOR', val: 'rednebula100' },
  { key: 'LOCATION', val: 'Sol III · 37°N' },
  { key: 'MISSION',  val: 'Build sharp things' },
  { key: 'CLASS',    val: 'INDEPENDENT DEV' },
  { key: 'UPTIME',   val: '2019–PRESENT' },
  { key: 'STATUS',   val: 'TRANSMISSION LIVE' },
  { key: 'LANG PRI', val: 'C / Zig / Go' },
  { key: 'COORDS',   val: 'NGC-GRID 00h 00m' },
]

export default function Hero({ projects }) {
  const h1a = useScramble('RED', 0)
  const h1b = useScramble('NEBULA', 180)
  const sub  = useScramble('STATION RECORD · OPERATOR HUB', 420)

  const statusCells = [
    { key: 'PROJECTS',   val: `${projects.length}` },
    { key: 'LIVE',       val: `${projects.filter(p => p.status === 'LIVE').length}` },
    { key: 'WIP',        val: `${projects.filter(p => p.status === 'WIP').length}` },
    { key: 'STACK COUNT',val: `${[...new Set(projects.flatMap(p => p.stack))].length}` },
    { key: 'LAST COMMIT',val: 'APR 2026' },
    { key: 'SIGNAL',     val: 'STRONG' },
  ]

  return (
    <section id="s00">
      <div className="hero">
        <div className="hero-main">
          <div className="hero-eyebrow">TRANSMISSION · NGC-GRID · SIGNAL STRONG</div>
          <h1 className="hero-h1">
            <span className="red">{h1a}</span>
            <span className="sep"> // </span>
            <span>{h1b}</span>
          </h1>
          <div className="hero-sub">{sub}</div>
          <p className="hero-lede">
            Independent systems developer. Builds <em>games</em>, <em>tools</em>, and <em>libraries</em>
            {' '}from first principles — low-level, minimal, precise. Everything here is
            {' '}live transmission from the workbench.
          </p>
        </div>
        <div className="hero-meta">
          <div className="hero-meta-grid">
            {META.map(m => (
              <div key={m.key} className="hero-meta-cell">
                <span className="meta-key">{m.key}</span>
                <span className="meta-val">{m.val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="status-strip">
        {statusCells.map(c => (
          <div key={c.key} className="status-cell">
            <span className="status-key">{c.key}</span>
            <span className="status-val">{c.val}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

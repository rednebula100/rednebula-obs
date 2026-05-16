import { useState, useEffect, useCallback } from 'react'
import '../styles/boot.css'

const LINES = [
  { ts: '00:00:00.000', msg: 'REDNEBULA · STATION RECORD — SYSTEM INIT', code: '0x00' },
  { ts: '00:00:00.012', msg: '<dim>loading kernel modules...</dim>', code: '—' },
  { ts: '00:00:00.140', msg: 'CPU 8C@3.6GHz · RAM 32G · ARCH x86_64', code: '0x01' },
  { ts: '00:00:00.225', msg: 'mounting project catalogue... <ok>[OK]</ok>', code: '0x02' },
  { ts: '00:00:00.380', msg: 'initialising WebGL context... <ok>[OK]</ok>', code: '0x03' },
  { ts: '00:00:00.512', msg: 'optical scope — fragment shader compiled', code: '0x04' },
  { ts: '00:00:00.690', msg: 'telemetry feed <ok>LIVE</ok> · uptime 0d 00:00:00', code: '0x05' },
  { ts: '00:00:00.820', msg: '<dim>signal acquisition... </dim><ok>NGC-GRID LOCK</ok>', code: '0x06' },
  { ts: '00:00:01.040', msg: 'boot complete — <ok>STATION RECORD ONLINE</ok>', code: '0xFF' },
]

function parse(msg) {
  return msg
    .replace(/<ok>(.*?)<\/ok>/g, '<span class="ok">$1</span>')
    .replace(/<warn>(.*?)<\/warn>/g, '<span class="warn">$1</span>')
    .replace(/<dim>(.*?)<\/dim>/g, '<span class="dim">$1</span>')
}

export default function Boot({ onDone }) {
  const [visible, setVisible] = useState([])
  const [fading, setFading]   = useState(false)

  const skip = useCallback(() => {
    setFading(true)
    setTimeout(onDone, 350)
  }, [onDone])

  useEffect(() => {
    const delays = [0, 140, 225, 380, 512, 690, 820, 940, 1040]
    const timers = delays.map((d, i) => setTimeout(() => setVisible(v => [...v, i]), d))
    timers.push(setTimeout(() => { setFading(true); setTimeout(onDone, 350) }, 1420))
    return () => timers.forEach(clearTimeout)
  }, [onDone])

  useEffect(() => {
    const h = () => skip()
    window.addEventListener('click', h)
    window.addEventListener('keydown', h)
    return () => { window.removeEventListener('click', h); window.removeEventListener('keydown', h) }
  }, [skip])

  return (
    <div className="boot" style={{ opacity: fading ? 0 : 1 }}>
      {LINES.map((l, i) => (
        <div key={i} className={`boot-line ${visible.includes(i) ? 'visible' : ''}`}>
          <span className="boot-ts">{l.ts}</span>
          <span className="boot-msg" dangerouslySetInnerHTML={{ __html: parse(l.msg) }} />
          <span className="boot-code">{l.code}</span>
        </div>
      ))}
      {visible.includes(LINES.length - 1) && !fading && (
        <div className="boot-line visible" style={{ marginTop: 8 }}>
          <span className="boot-ts" /><span className="boot-msg"><span className="boot-cursor" /></span><span className="boot-code" />
        </div>
      )}
    </div>
  )
}

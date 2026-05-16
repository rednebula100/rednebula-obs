import { useState, useRef, useEffect } from 'react'
import '../styles/terminal.css'

const INIT = [{ ts: '00:00:01', msg: 'Station terminal ready. Type <span class="ok">help</span> for commands.', code: '0x00' }]

function makeCmds(projects) {
  return {
    help: () => [
      { msg: 'Commands:' },
      { msg: '  <span class="ok">ls</span>       — list all projects' },
      { msg: '  <span class="ok">cat</span> &lt;id&gt; — show project details (e.g. cat NGC-2440)' },
      { msg: '  <span class="ok">stat</span>     — station statistics' },
      { msg: '  <span class="ok">clear</span>    — clear terminal' },
    ],
    ls: () => projects.map(p => ({ msg: `  <span class="ok">${p.id}</span>  ${p.name}  <span style="color:var(--dim)">[${p.statusLabel}]</span>`, code: p.type })),
    stat: () => [
      { msg: `Projects: ${projects.length}` },
      { msg: `Live:     ${projects.filter(p => p.status === 'LIVE').length}` },
      { msg: `WIP:      ${projects.filter(p => p.status === 'WIP').length}` },
      { msg: `Archived: ${projects.filter(p => p.status === 'ARCHIVED').length}` },
      { msg: `Stacks:   ${[...new Set(projects.flatMap(p => p.stack))].length} unique` },
    ],
  }
}

function ts() { return new Date().toTimeString().slice(0, 8) }

export default function Terminal({ projects }) {
  const [open, setOpen]       = useState(false)
  const [lines, setLines]     = useState(INIT)
  const [input, setInput]     = useState('')
  const [history, setHistory] = useState([])
  const [histIdx, setHistIdx] = useState(-1)
  const bodyRef  = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => { if (open && inputRef.current) inputRef.current.focus() }, [open])
  useEffect(() => { if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight }, [lines])

  const run = (cmd) => {
    const [name, ...args] = cmd.trim().split(/\s+/)
    let out = []

    if (name === 'clear') { setLines([]); return }

    const CMDS = makeCmds(projects)

    if (name === 'cat') {
      const id = args[0]?.toUpperCase()
      const p  = projects.find(p => p.id === id)
      if (!p) { out = [{ msg: `<span class="err">cat: ${args[0] ?? '?'}: no such record</span>`, code: '1' }] }
      else out = [
        { msg: `ID:     ${p.id}` }, { msg: `NAME:   ${p.name}` }, { msg: `TYPE:   ${p.type}` },
        { msg: `STATUS: <span class="${p.status === 'LIVE' ? 'ok' : p.status === 'WIP' ? 'warn' : 'err'}">${p.statusLabel}</span>` },
        { msg: `STACK:  ${p.stack.join(', ')}` }, { msg: `SEED:   ${p.seed.toFixed(3)}` },
        { msg: `RA/DEC: ${p.ra} / ${p.dec}` },
      ]
    } else if (CMDS[name]) {
      out = CMDS[name]()
    } else if (name) {
      out = [{ msg: `<span class="err">command not found: ${name}</span>`, code: '127' }]
    }

    setLines(l => [
      ...l,
      { ts: ts(), msg: `<span style="color:var(--accent)">▶</span> ${cmd}`, code: '' },
      ...out.map(o => ({ ts: ts(), code: '', ...o })),
    ])
  }

  const onKey = (e) => {
    if (e.key === 'Enter') {
      if (input.trim()) { setHistory(h => [input, ...h]); setHistIdx(-1) }
      run(input); setInput('')
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      const idx = Math.min(histIdx + 1, history.length - 1)
      setHistIdx(idx); setInput(history[idx] ?? '')
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      const idx = Math.max(histIdx - 1, -1)
      setHistIdx(idx); setInput(idx === -1 ? '' : history[idx] ?? '')
    }
  }

  return (
    <>
      <button className="term-trigger" onClick={() => setOpen(o => !o)}>
        <span className="term-trigger-dot" />CONSOLE <kbd>`</kbd>
      </button>

      <div className={`term ${open ? 'open' : ''}`}>
        <div className="term-bar" onClick={() => setOpen(o => !o)}>
          <div className="term-bar-left"><span className="term-bar-pulse" />STATION CONSOLE</div>
          <div className="term-bar-right">{open ? '▼' : '▲'}</div>
        </div>
        {open && (
          <>
            <div className="term-body" ref={bodyRef}>
              {lines.map((l, i) => (
                <div key={i} className="term-line">
                  <span className="term-line-ts">{l.ts ?? ''}</span>
                  <span className="term-line-msg" dangerouslySetInnerHTML={{ __html: l.msg }} />
                  <span className="term-line-code">{l.code ?? ''}</span>
                </div>
              ))}
            </div>
            <div className="term-prompt">
              <span className="term-prompt-label">NGC-GRID ▶</span>
              <div className="term-cursor" />
              <input ref={inputRef} className="term-input" value={input}
                onChange={e => setInput(e.target.value)} onKeyDown={onKey}
                spellCheck={false} autoComplete="off" />
            </div>
          </>
        )}
      </div>
    </>
  )
}

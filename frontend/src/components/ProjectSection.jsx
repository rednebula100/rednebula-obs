import { useState, useMemo, useRef } from 'react'
import '../styles/projects.css'
import Scope, { FILTER_MODES } from './Scope.jsx'
import Sparkline from './Sparkline.jsx'
import Dossier from './Dossier.jsx'

const TYPES = ['ALL', 'GAME', 'WEB', 'LIB', 'TOOL']
const COLS = [
  { key: 'id',       label: 'DESIG',    cls: 'col-desig' },
  { key: 'name',     label: 'NAME',     cls: 'col-name' },
  { key: 'type',     label: 'CLASS',    cls: 'col-class' },
  { key: 'stack',    label: 'STACK',    cls: 'col-stack',  nosort: true },
  { key: 'activity', label: 'ACTIVITY', cls: 'col-act',    nosort: true },
  { key: 'mag',      label: 'MAG',      cls: 'col-mag' },
  { key: 'year',     label: 'YEAR',     cls: 'col-year' },
  { key: 'status',   label: 'STATUS',   cls: 'col-status' },
  { key: 'link',     label: '↗',        cls: 'col-link',   nosort: true },
]

function sorter(a, b, col, dir) {
  const av = a[col], bv = b[col]
  if (av === bv) return 0
  return (av < bv ? -1 : 1) * (dir === 'asc' ? 1 : -1)
}

export default function ProjectSection({ accentHex, projects }) {
  const [activeType, setActiveType]   = useState('ALL')
  const [search, setSearch]           = useState('')
  const [sortCol, setSortCol]         = useState('year')
  const [sortDir, setSortDir]         = useState('desc')
  const [view, setView]               = useState('table')
  const [focused, setFocused]         = useState(null)
  const [dossier, setDossier]         = useState(null)
  const hoverTimer = useRef(null)

  const filtered = useMemo(() => {
    let list = projects
    if (activeType !== 'ALL') list = list.filter(p => p.type === activeType)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.stack.some(s => s.toLowerCase().includes(q))
      )
    }
    return [...list].sort((a, b) => sorter(a, b, sortCol, sortDir))
  }, [projects, activeType, search, sortCol, sortDir])

  const typeCounts = useMemo(() =>
    Object.fromEntries(TYPES.map(t => [t, t === 'ALL' ? projects.length : projects.filter(p => p.type === t).length]))
  , [projects])

  const handleSort = (col) => {
    if (col === sortCol) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortCol(col); setSortDir('asc') }
  }

  const onRowEnter = (p) => { clearTimeout(hoverTimer.current); setFocused(p) }
  const onRowLeave = ()  => { hoverTimer.current = setTimeout(() => setFocused(null), 200) }

  const sortIcon = (col) => col !== sortCol ? '⇅' : sortDir === 'asc' ? '▲' : '▼'

  // Active filter drives the scope observation mode
  const scopeMode = activeType === 'ALL' ? (focused?.type ?? 'ALL') : activeType

  return (
    <section className="sect" id="s01">
      <div className="sect-hd">
        <span className="sect-hd-sid">§01</span>
        <span className="sect-hd-title">
          PROJECT INDEX · CATALOGUE
          {activeType !== 'ALL' && ` · ${FILTER_MODES[activeType]?.name}`}
        </span>
        <span className="sect-hd-sub">{filtered.length} records</span>
      </div>

      {/* Toolbar */}
      <div className="proj-toolbar">
        <div className="proj-toolbar-tags">
          {TYPES.map(t => (
            <button key={t} className={`tag ${activeType === t ? 'active' : ''}`} onClick={() => setActiveType(t)}>
              {t} <span className="tag-count">{typeCounts[t]}</span>
            </button>
          ))}
        </div>
        <div className="proj-search">
          <span className="proj-search-label">FIND</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="search..." />
          {search && <span className="proj-search-clear" onClick={() => setSearch('')}>×</span>}
        </div>
        <div className="view-toggle">
          <button className={`view-btn ${view === 'table' ? 'active' : ''}`} onClick={() => setView('table')}>≡</button>
          <button className={`view-btn ${view === 'grid'  ? 'active' : ''}`} onClick={() => setView('grid')}>⊞</button>
        </div>
      </div>

      {/* Scope + content */}
      <div className="scope-wrap">
        <div className="scope-sticky"
          onMouseEnter={() => clearTimeout(hoverTimer.current)}
          onMouseLeave={onRowLeave}>
          <Scope
            project={focused}
            accent={accentHex}
            mode={scopeMode}
            onOpenDossier={setDossier}
          />
        </div>

        <div style={{ minWidth: 0 }}>
          {view === 'table' ? (
            <div className="ptable-wrap">
              <table className="ptable">
                <thead>
                  <tr>
                    {COLS.map(c => (
                      <th key={c.key} className={`${c.cls} ${sortCol === c.key ? 'sorted' : ''}`}
                        onClick={c.nosort ? undefined : () => handleSort(c.key)}
                        style={c.nosort ? { cursor: 'default' } : {}}>
                        {c.label}
                        {!c.nosort && <span className="sorter">{sortIcon(c.key)}</span>}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(p => (
                    <tr key={p.id}
                      className={focused?.id === p.id ? 'focused' : ''}
                      onMouseEnter={() => onRowEnter(p)}
                      onMouseLeave={onRowLeave}
                      onClick={() => setDossier(p)}>
                      <td className="col-desig"><span className="pid">{p.id}</span></td>
                      <td className="col-name">
                        <span className="pname-main">{p.name}</span>
                        <span className="pname-sub">{p.sub}</span>
                      </td>
                      <td className="col-class">{p.type}</td>
                      <td className="col-stack">
                        <div className="pstack-chips">
                          {p.stack.slice(0, 3).map(s => <span key={s} className="pstack-chip">{s}</span>)}
                          {p.stack.length > 3 && <span className="pstack-chip">+{p.stack.length - 3}</span>}
                        </div>
                      </td>
                      <td className="col-act"><Sparkline data={p.activity} /></td>
                      <td className="col-mag">{p.mag.toFixed(1)}</td>
                      <td className="col-year">{p.year}</td>
                      <td className="col-status"><span className={`badge badge-${p.status}`}>{p.statusLabel}</span></td>
                      <td className="col-link">
                        {(p.repoUrl || p.liveUrl) && (
                          <a href={p.liveUrl || p.repoUrl} target="_blank" rel="noreferrer"
                            className="plink-btn" onClick={e => e.stopPropagation()}>↗</a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="pgrid">
              {filtered.map(p => (
                <div key={p.id}
                  className={`pcard ${focused?.id === p.id ? 'focused' : ''}`}
                  onMouseEnter={() => onRowEnter(p)}
                  onMouseLeave={onRowLeave}
                  onClick={() => setDossier(p)}>
                  <div className="pcard-top">
                    <span className="pcard-pid">{p.id}</span>
                    <span className="pcard-mag">◎ {p.mag.toFixed(1)}</span>
                  </div>
                  <div className="pcard-name">{p.name}</div>
                  <div className="pcard-desc">{p.description}</div>
                  <div className="pcard-chips">{p.stack.map(s => <span key={s} className="chip">{s}</span>)}</div>
                  <Sparkline data={p.activity} />
                  <div className="pcard-footer">
                    <span className="pcard-year">{p.year}</span>
                    <span className={`badge badge-${p.status}`}>{p.statusLabel}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {dossier && <Dossier project={dossier} accentHex={accentHex} onClose={() => setDossier(null)} />}
    </section>
  )
}

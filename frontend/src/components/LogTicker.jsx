import '../styles/ticker.css'

function TickerItem({ p }) {
  const when = new Date(p.updatedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  return (
    <span className="ticker-item">
      <span className="ticker-dot" />
      <span className="ticker-line">
        <span className={`t-status t-status-${p.status}`}>[{p.statusLabel}]</span>
        <span className="t-name">{p.name}</span>
        <span className="t-meta">{p.id} · {p.type} · {when}</span>
      </span>
    </span>
  )
}

export default function LogTicker({ projects }) {
  const doubled = [...projects, ...projects]
  return (
    <div className="log-ticker">
      <div className="ticker-track">
        {doubled.map((p, i) => <TickerItem key={`${p.id}-${i}`} p={p} />)}
      </div>
    </div>
  )
}

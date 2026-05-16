import { useEffect, useState } from 'react'
import '../styles/dossier.css'
import Scope from './Scope.jsx'
import { recordView, fetchAnalytics } from '../data/api.js'

export default function Dossier({ project: p, accentHex, onClose }) {
  const [activity, setActivity] = useState(p.activity)
  const [analyticsLoading, setAnalyticsLoading] = useState(true)

  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])

  useEffect(() => {
    recordView(p.id).catch(() => {})
    fetchAnalytics(p.id)
      .then(rows => {
        if (rows && rows.length > 0) {
          setActivity(rows.map(r => r.count))
        }
      })
      .catch(() => {})
      .finally(() => setAnalyticsLoading(false))
  }, [p.id])

  const max = Math.max(...activity, 1)
  const statusColor = { LIVE: 'var(--ok)', WIP: 'var(--warn)', ALPHA: 'var(--accent-b)', ARCHIVED: 'var(--dim)' }[p.status]

  return (
    <div className="dossier-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="dossier-panel">
        <div className="dossier-hd">
          <span className="dos-hd-id">DOSSIER · {p.id}</span>
          <span className="dos-hd-title">{p.name}</span>
          <span className="dos-hd-meta">{p.type} · {p.year} · ◎ {p.mag.toFixed(1)}</span>
          <button className="dos-hd-close" onClick={onClose}>×</button>
        </div>

        <div className="dossier-body">
          <div className="dos-info">
            <div>
              <div className="dos-section-label">BRIEF</div>
              <div className="dos-brief">{p.description}</div>
            </div>
            <div>
              <div className="dos-section-label">STACK</div>
              <div className="dos-chips">{p.stack.map(s => <span key={s} className="chip">{s}</span>)}</div>
            </div>
            <div>
              <div className="dos-section-label">VITALS</div>
              <div className="dos-stats">
                <div><div className="dos-stat-key">CLASS</div><div className="dos-stat-val">{p.type}</div></div>
                <div><div className="dos-stat-key">MAG</div><div className="dos-stat-val">{p.mag.toFixed(1)}</div></div>
                <div><div className="dos-stat-key">YEAR</div><div className="dos-stat-val">{p.year}</div></div>
                <div><div className="dos-stat-key">STATUS</div><div className="dos-stat-val" style={{ color: statusColor }}>{p.statusLabel}</div></div>
              </div>
            </div>
            <div>
              <div className="dos-section-label">SIGNAL ID</div>
              <div className="dos-code">{`DESIG   ${p.id}
NAME    ${p.name}
CLASS   ${p.type}
STATUS  ${p.statusLabel}
EPOCH   ${p.year}
MAG     ${p.mag.toFixed(1)}
RA      ${p.ra}
DEC     ${p.dec}`}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {p.repoUrl && <a href={p.repoUrl} target="_blank" rel="noreferrer" className="btn">↗ REPO</a>}
              {p.liveUrl && <a href={p.liveUrl} target="_blank" rel="noreferrer" className="btn primary">▶ LIVE</a>}
            </div>
          </div>

          <div className="dos-visual">
            <Scope project={p} accent={accentHex} mode={p.type} dossierMode />
            <div className="dos-visual-body">
              <div className="dos-section-label" style={{ marginBottom: 10 }}>
                ACTIVITY TRACE · {analyticsLoading ? '…' : `${activity.length}D`}
              </div>
              <div style={{ display: 'flex', gap: 3, alignItems: 'flex-end' }}>
                {activity.map((v, i) => (
                  <div key={i} style={{
                    width: 14, height: Math.max(4, Math.round((v / max) * 72)),
                    background: v === max ? 'var(--accent)' : 'var(--accent-d)',
                  }} />
                ))}
              </div>
              <div style={{ marginTop: 6, fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--dim)', letterSpacing: '0.08em' }}>
                {analyticsLoading ? 'LOADING…' : 'DAILY VIEW RECORD'}
              </div>
              {p.views != null && (
                <div style={{ marginTop: 20 }}>
                  <div className="dos-section-label" style={{ marginBottom: 6 }}>VIEWS</div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 22, color: 'var(--txt)' }}>{p.views.toLocaleString()}</div>
                </div>
              )}
              <div style={{ marginTop: 20 }}>
                <div className="dos-section-label" style={{ marginBottom: 6 }}>LAST UPDATED</div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--txt)' }}>
                  {new Date(p.updatedAt).toUTCString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

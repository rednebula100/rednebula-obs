import '../styles/topbar.css'

const NAV = [
  { href: '#s00', label: '§00 STATION' },
  { href: '#s01', label: '§01 CATALOGUE' },
  { href: '#s02', label: '§02 MANIFEST' },
  { href: '#s03', label: '§03 CHANNELS' },
]

export default function TopBar({ onTweaks }) {
  return (
    <header className="topbar">
      <div className="topbar-brand">RED NEBULA</div>
      <nav className="topnav">
        {NAV.map(n => <a key={n.href} href={n.href}>{n.label}</a>)}
      </nav>
      <div className="topbar-status">
        <div className="topbar-pulse" />
        <div className="topbar-badge">ONLINE</div>
      </div>
      <button className="btn" onClick={onTweaks}>⌘ TWEAKS</button>
    </header>
  )
}

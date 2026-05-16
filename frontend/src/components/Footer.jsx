import '../styles/footer.css'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-left">
        <span className="footer-txt">© {new Date().getFullYear()} Red Nebula · All transmissions reserved</span>
        <span className="footer-txt" style={{ color: 'var(--dim)' }}>Built with Vite + React · No trackers · No cookies</span>
      </div>
      <div className="footer-center">
        <div className="footer-sig">RED NEBULA // STATION RECORD</div>
        <div className="footer-txt" style={{ marginTop: 6, color: 'var(--xdim)' }}>NGC-GRID · SOL III · 37°N</div>
      </div>
      <div className="footer-right">
        <span className="footer-txt"><a href="https://github.com/rednebula100" target="_blank" rel="noreferrer">github.com/rednebula100</a></span>
        <span className="footer-txt" style={{ color: 'var(--dim)' }}>signal: strong · uptime: always</span>
      </div>
    </footer>
  )
}

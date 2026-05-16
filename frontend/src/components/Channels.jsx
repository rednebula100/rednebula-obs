import '../styles/channels.css'

const LINKS = [
  { platform: 'GITHUB',   main: 'github.com/rednebula100',     sub: 'source code · open repos',  stat: '6 public',    href: 'https://github.com/rednebula100' },
  { platform: 'EMAIL',    main: 'rednebula100@gmail.com',       sub: 'direct contact',             stat: '< 48h reply', href: 'mailto:rednebula100@gmail.com' },
  { platform: 'ITCH.IO',  main: 'rednebula.itch.io',           sub: 'game releases',              stat: '2 titles',    href: '#' },
  { platform: 'RSS',      main: 'rednebula.dev/feed.xml',       sub: 'devlog · updates',           stat: 'ATOM 1.0',    href: '#' },
  { platform: 'MASTODON', main: '@rednebula@hachyderm.io',      sub: 'sporadic transmissions',     stat: 'fediverse',   href: '#' },
  { platform: 'DISCORD',  main: 'rednebula100',                 sub: 'dm open · no server',        stat: 'async',       href: '#' },
]

export default function Channels() {
  return (
    <section className="sect" id="s03">
      <div className="sect-hd">
        <span className="sect-hd-sid">§03</span>
        <span className="sect-hd-title">OPEN CHANNELS</span>
        <span className="sect-hd-sub">{LINKS.length} endpoints</span>
      </div>
      <div className="channels-grid">
        {LINKS.map(l => (
          <a key={l.platform} className="linkcard" href={l.href} target="_blank" rel="noreferrer">
            <span className="lc-platform">{l.platform}</span>
            <span><div className="lc-main">{l.main}</div><div className="lc-sub">{l.sub}</div></span>
            <span className="lc-stat">{l.stat}</span>
            <span className="lc-arrow">↗</span>
          </a>
        ))}
      </div>
    </section>
  )
}

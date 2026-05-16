import '../styles/about.css'

const VITALS = [
  { key: 'HANDLE',  val: 'rednebula100' },
  { key: 'BASE',    val: 'Earth, Sol III' },
  { key: 'ACTIVE',  val: '2019 – PRESENT' },
  { key: 'FOCUS',   val: 'Systems / Games / Tools' },
  { key: 'CONTACT', val: 'rednebula100@gmail.com' },
]

const STACK_GROUPS = [
  { label: 'LANGUAGES', items: [{ name:'C', year:"'19" }, { name:'Zig', year:"'22" }, { name:'Go', year:"'21" }, { name:'Rust', year:"'23" }, { name:'Python', year:"'19" }, { name:'TypeScript', year:"'20" }] },
  { label: 'GRAPHICS / SYS', items: [{ name:'OpenGL', year:"'20" }, { name:'WebGL', year:"'21" }, { name:'WebGPU', year:"'24" }, { name:'WASM', year:"'22" }, { name:'SDL3', year:"'23" }] },
  { label: 'WEB', items: [{ name:'React', year:"'20" }, { name:'Vite', year:"'22" }, { name:'Plain CSS', year:"'19" }, { name:'SQLite', year:"'21" }] },
]

export default function About() {
  return (
    <section className="sect" id="s02">
      <div className="sect-hd">
        <span className="sect-hd-sid">§02</span>
        <span className="sect-hd-title">STATION RECORD · TECH MANIFEST</span>
        <span className="sect-hd-sub">operator profile</span>
      </div>
      <div className="two">
        <div className="bio">
          <p className="bio-body">
            I'm <em>Red Nebula</em> — an independent developer who builds things from scratch.
            Games with physics that feel real. Tools that do exactly one thing well.
            Libraries that give you control without taking it away.
          </p>
          <p className="bio-body">
            Started with C in 2019. Found that the closer to the metal, the clearer the thinking.
            Every project here is a transmission — something finished enough to be useful,
            rough enough to be honest.
          </p>
          <p className="bio-body">
            Currently exploring: WebGPU compute, procedural world-generation,
            and minimum-viable game engines.
          </p>
          <div className="vitals">
            {VITALS.map(v => (
              <div key={v.key} className="vital-row">
                <span className="vital-key">{v.key}</span>
                <span className="vital-val">{v.val}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="stack-panel">
          {STACK_GROUPS.map(g => (
            <div key={g.label} className="stack-group">
              <div className="stack-group-h4">{g.label}</div>
              <div className="stack-list">
                {g.items.map(item => (
                  <div key={item.name} className="stack-item">
                    <span className="stack-item-name">{item.name}</span>
                    <span className="stack-item-year">{item.year}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

import { useState, useCallback, useEffect } from 'react'
import './styles/tokens.css'
import './styles/global.css'

import Boot           from './components/Boot.jsx'
import TopBar         from './components/TopBar.jsx'
import Hero           from './components/Hero.jsx'
import ProjectSection from './components/ProjectSection.jsx'
import About          from './components/About.jsx'
import Channels       from './components/Channels.jsx'
import LogTicker      from './components/LogTicker.jsx'
import Footer         from './components/Footer.jsx'
import Terminal       from './components/Terminal.jsx'
import Tweaks         from './components/Tweaks.jsx'
import { fetchProjects, recordView } from './data/api.js'

export default function App() {
  const [booted,     setBooted]     = useState(false)
  const [tweaksOpen, setTweaksOpen] = useState(false)
  const [accent,     setAccent]     = useState('#d97070')
  const [projects,   setProjects]   = useState([])
  const [loading,    setLoading]    = useState(true)

  const handleBoot = useCallback(() => setBooted(true), [])

  useEffect(() => {
    recordView('homepage').catch(() => {})
    fetchProjects()
      .then(setProjects)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <>
      {!booted && <Boot onDone={handleBoot} />}

      <TopBar onTweaks={() => setTweaksOpen(o => !o)} />

      <div className="shell">
        <Hero projects={projects} />
        <ProjectSection accentHex={accent} projects={projects} loading={loading} />
        <About />
        <Channels />
        <LogTicker projects={projects} />
        <Footer />
      </div>

      <Terminal projects={projects} />

      <Tweaks
        open={tweaksOpen}
        onClose={() => setTweaksOpen(false)}
        accent={accent}
        onAccent={setAccent}
      />
    </>
  )
}

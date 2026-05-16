import { Hono } from 'hono'
import { getPublicRepos, stableNgcId, stableSeed, seedToRa, seedToDec } from '../lib/github.js'

const GITHUB_USERNAME = 'rednebula100'
const EXCLUDED = new Set(['rednebula-obs'])

const projects = new Hono()

function lcgSeq(seed, n) {
  const out = []
  let s = seed
  for (let i = 0; i < n; i++) {
    s = (s * 9301 + 49297) % 233280
    out.push(+(s / 233280).toFixed(3))
  }
  return out
}

projects.get('/', async (c) => {
  try {
    const [repos, { results: metaRows }] = await Promise.all([
      getPublicRepos(c.env.KV, GITHUB_USERNAME, c.env.GITHUB_TOKEN),
      c.env.DB.prepare('SELECT * FROM project_meta').all(),
    ])

    const metaMap = Object.fromEntries(metaRows.map(m => [m.repo_name, m]))

    const enriched = await Promise.all(
      repos
        .filter(r => !EXCLUDED.has(r.name))
        .map(async r => {
          const m     = metaMap[r.name] ?? {}
          const id    = stableNgcId(r.name)
          const seed  = m.seed ?? stableSeed(r.name)
          const numId = parseInt(id.replace('NGC-', ''), 10)
          const views = parseInt(await c.env.KV.get(`views:${id}`) ?? '0', 10)
          const status = r.archived ? 'ARCHIVED' : (m.override_status ?? 'WIP')
          const mag    = m.mag ?? parseFloat((4 + r.stargazers_count * 0.5).toFixed(1))

          return {
            id,
            name:        r.name,
            sub:         m.sub         ?? (r.description ?? ''),
            description: r.description ?? '',
            type:        m.type        ?? 'WEB',
            status,
            statusLabel: status,
            year:        new Date(r.created_at).getFullYear(),
            mag,
            seed,
            ra:          m.ra  ?? seedToRa(seed),
            dec:         m.dec ?? seedToDec(seed),
            stack:       JSON.parse(m.stack ?? '[]'),
            activity:    lcgSeq(numId, 14),
            liveUrl:     r.homepage || null,
            repoUrl:     r.html_url,
            updatedAt:   r.pushed_at,
            views,
            stars:       r.stargazers_count,
            forks:       r.forks_count,
            language:    r.language,
          }
        })
    )

    return c.json({ success: true, data: enriched, error: null })
  } catch (e) {
    return c.json({ success: false, data: null, error: e.message }, 500)
  }
})

export default projects

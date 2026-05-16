import { Hono } from 'hono'
import { getRepoData, parseRepoPath } from '../lib/github.js'

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
    const { results } = await c.env.DB.prepare(
      'SELECT * FROM projects ORDER BY year DESC, id ASC'
    ).all()

    const enriched = await Promise.all(results.map(async (p) => {
      const views    = parseInt(await c.env.KV.get(`views:${p.id}`) ?? '0', 10)
      const numId    = parseInt(p.id.replace('NGC-', ''), 10)
      const activity = lcgSeq(numId, 14)
      const stack    = JSON.parse(p.stack ?? '[]')

      let gh = null
      const repoPath = parseRepoPath(p.repo_url)
      if (repoPath) gh = await getRepoData(c.env.KV, repoPath, c.env.GITHUB_TOKEN)

      return {
        id:              p.id,
        name:            p.name,
        sub:             p.sub,
        description:     p.description,
        type:            p.type,
        status:          p.status,
        statusLabel:     p.status,
        year:            p.year,
        mag:             p.mag,
        seed:            p.seed,
        ra:              p.ra,
        dec:             p.dec,
        stack,
        activity,
        liveUrl:         p.live_url,
        repoUrl:         p.repo_url,
        updatedAt:       p.updated_at,
        views,
        stars:           gh?.stars    ?? null,
        forks:           gh?.forks    ?? null,
        language:        gh?.language ?? null,
        githubUpdatedAt: gh?.updatedAt ?? null,
      }
    }))

    return c.json({ success: true, data: enriched, error: null })
  } catch (e) {
    return c.json({ success: false, data: null, error: e.message }, 500)
  }
})

export default projects

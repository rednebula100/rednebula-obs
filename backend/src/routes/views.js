import { Hono } from 'hono'

const DEDUP_TTL = 600   // 10 minutes — blocks re-count per visitor per target

const views = new Hono()

views.post('/:id', async (c) => {
  const { id } = c.req.param()
  // Prefer CF-Connecting-IP; fall back to CF-Ray for dedup key uniqueness
  const visitor = c.req.header('CF-Connecting-IP') ?? c.req.header('CF-Ray') ?? 'unknown'

  try {
    const dedupKey = `ratelimit:${visitor}:${id}`
    if (await c.env.KV.get(dedupKey)) {
      return c.json({ success: true, data: { skipped: true }, error: null })
    }

    const countKey = id === 'homepage' ? 'views:homepage' : `views:${id}`
    const current  = parseInt(await c.env.KV.get(countKey) ?? '0', 10)
    const next     = current + 1

    await c.env.KV.put(countKey, String(next))
    await c.env.KV.put(dedupKey, '1', { expirationTtl: DEDUP_TTL })

    // Write daily bucket to D1
    const date = new Date().toISOString().slice(0, 10)
    await c.env.DB.prepare(
      `INSERT INTO daily_views (target_id, date, count) VALUES (?, ?, 1)
       ON CONFLICT (target_id, date) DO UPDATE SET count = count + 1`
    ).bind(id, date).run()

    return c.json({ success: true, data: { count: next }, error: null })
  } catch (e) {
    return c.json({ success: false, data: null, error: e.message }, 500)
  }
})

views.get('/', async (c) => {
  try {
    const { results } = await c.env.DB.prepare('SELECT id FROM projects').all()

    const targets = [
      { key: 'homepage', kvKey: 'views:homepage' },
      ...results.map(p => ({ key: p.id, kvKey: `views:${p.id}` })),
    ]

    const pairs = await Promise.all(
      targets.map(async ({ key, kvKey }) => {
        const count = parseInt(await c.env.KV.get(kvKey) ?? '0', 10)
        return [key, count]
      })
    )

    return c.json({ success: true, data: Object.fromEntries(pairs), error: null })
  } catch (e) {
    return c.json({ success: false, data: null, error: e.message }, 500)
  }
})

export default views

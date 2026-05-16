import { Hono } from 'hono'

const analytics = new Hono()

analytics.post('/record', async (c) => {
  try {
    const body = await c.req.json()
    const { id, date } = body ?? {}
    if (!id || !date) {
      return c.json({ success: false, data: null, error: 'id and date required' }, 400)
    }

    await c.env.DB.prepare(
      `INSERT INTO daily_views (target_id, date, count) VALUES (?, ?, 1)
       ON CONFLICT (target_id, date) DO UPDATE SET count = count + 1`
    ).bind(id, date).run()

    return c.json({ success: true, data: null, error: null })
  } catch (e) {
    return c.json({ success: false, data: null, error: e.message }, 500)
  }
})

analytics.get('/:id', async (c) => {
  const { id } = c.req.param()
  try {
    const { results } = await c.env.DB.prepare(
      `SELECT date, count FROM daily_views
       WHERE target_id = ?
         AND date >= date('now', '-30 days')
       ORDER BY date ASC`
    ).bind(id).all()

    return c.json({ success: true, data: results, error: null })
  } catch (e) {
    return c.json({ success: false, data: null, error: e.message }, 500)
  }
})

export default analytics

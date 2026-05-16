import { Hono } from 'hono'

const ALLOWED_FIELDS = ['name', 'description', 'type', 'status', 'live_url', 'repo_url']

const admin = new Hono()

admin.get('/projects', async (c) => {
  try {
    const { results } = await c.env.DB.prepare(
      'SELECT * FROM projects ORDER BY id'
    ).all()
    return c.json({ success: true, data: results, error: null })
  } catch (e) {
    return c.json({ success: false, data: null, error: e.message }, 500)
  }
})

admin.post('/projects', async (c) => {
  try {
    const { id, name, description, type, status, live_url, repo_url } = await c.req.json()
    if (!id || !name || !type || !status) {
      return c.json({ success: false, data: null, error: 'id, name, type, status required' }, 400)
    }

    await c.env.DB.prepare(
      `INSERT INTO projects (id, name, description, type, status, live_url, repo_url)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).bind(id, name, description ?? null, type, status, live_url ?? null, repo_url ?? null).run()

    return c.json({ success: true, data: { id }, error: null }, 201)
  } catch (e) {
    return c.json({ success: false, data: null, error: e.message }, 500)
  }
})

admin.patch('/projects/:id', async (c) => {
  const { id } = c.req.param()
  try {
    const body = await c.req.json()
    const updates = Object.entries(body).filter(([k]) => ALLOWED_FIELDS.includes(k))
    if (updates.length === 0) {
      return c.json({ success: false, data: null, error: 'No valid fields to update' }, 400)
    }

    const setClauses = updates.map(([k]) => `${k} = ?`).join(', ')
    const values     = updates.map(([, v]) => v)

    await c.env.DB.prepare(
      `UPDATE projects SET ${setClauses}, updated_at = datetime('now') WHERE id = ?`
    ).bind(...values, id).run()

    return c.json({ success: true, data: { id }, error: null })
  } catch (e) {
    return c.json({ success: false, data: null, error: e.message }, 500)
  }
})

admin.delete('/projects/:id', async (c) => {
  const { id } = c.req.param()
  try {
    await c.env.DB.prepare('DELETE FROM projects WHERE id = ?').bind(id).run()
    return c.json({ success: true, data: { id }, error: null })
  } catch (e) {
    return c.json({ success: false, data: null, error: e.message }, 500)
  }
})

export default admin

import { Hono } from 'hono'

const ALLOWED = ['type', 'sub', 'mag', 'seed', 'ra', 'dec', 'stack', 'override_status']

const admin = new Hono()

admin.get('/projects', async (c) => {
  try {
    const { results } = await c.env.DB.prepare(
      'SELECT * FROM project_meta ORDER BY repo_name'
    ).all()
    return c.json({ success: true, data: results, error: null })
  } catch (e) {
    return c.json({ success: false, data: null, error: e.message }, 500)
  }
})

// Upsert metadata for a repo
admin.post('/projects', async (c) => {
  try {
    const body = await c.req.json()
    const { repo_name, type = 'WEB', sub, mag, seed, ra, dec, stack = '[]', override_status } = body
    if (!repo_name) {
      return c.json({ success: false, data: null, error: 'repo_name required' }, 400)
    }

    await c.env.DB.prepare(
      `INSERT INTO project_meta (repo_name, type, sub, mag, seed, ra, dec, stack, override_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT (repo_name) DO UPDATE SET
         type = excluded.type, sub = excluded.sub, mag = excluded.mag,
         seed = excluded.seed, ra = excluded.ra, dec = excluded.dec,
         stack = excluded.stack, override_status = excluded.override_status`
    ).bind(repo_name, type, sub ?? null, mag ?? null, seed ?? null, ra ?? null, dec ?? null, stack, override_status ?? null).run()

    return c.json({ success: true, data: { repo_name }, error: null }, 201)
  } catch (e) {
    return c.json({ success: false, data: null, error: e.message }, 500)
  }
})

admin.patch('/projects/:repo_name', async (c) => {
  const { repo_name } = c.req.param()
  try {
    const body = await c.req.json()
    const updates = Object.entries(body).filter(([k]) => ALLOWED.includes(k))
    if (updates.length === 0) {
      return c.json({ success: false, data: null, error: 'No valid fields to update' }, 400)
    }

    const setClauses = updates.map(([k]) => `${k} = ?`).join(', ')
    await c.env.DB.prepare(
      `UPDATE project_meta SET ${setClauses} WHERE repo_name = ?`
    ).bind(...updates.map(([, v]) => v), repo_name).run()

    return c.json({ success: true, data: { repo_name }, error: null })
  } catch (e) {
    return c.json({ success: false, data: null, error: e.message }, 500)
  }
})

admin.delete('/projects/:repo_name', async (c) => {
  const { repo_name } = c.req.param()
  try {
    await c.env.DB.prepare('DELETE FROM project_meta WHERE repo_name = ?').bind(repo_name).run()
    return c.json({ success: true, data: { repo_name }, error: null })
  } catch (e) {
    return c.json({ success: false, data: null, error: e.message }, 500)
  }
})

export default admin

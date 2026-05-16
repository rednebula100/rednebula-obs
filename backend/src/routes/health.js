import { Hono } from 'hono'

const health = new Hono()

health.get('/', async (c) => {
  let d1Ok = false
  let kvOk = false

  try { await c.env.DB.prepare('SELECT 1').run(); d1Ok = true } catch {}
  try { await c.env.KV.put('health:ping', '1', { expirationTtl: 10 }); kvOk = true } catch {}

  return c.json({
    success: true,
    data: {
      status:    d1Ok && kvOk ? 'ok' : 'degraded',
      d1:        d1Ok,
      kv:        kvOk,
      timestamp: new Date().toISOString(),
    },
    error: null,
  })
})

export default health

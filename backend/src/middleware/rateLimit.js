const WINDOW_MS  = 60_000
const BUCKET_TTL = 120   // keep key alive 2× the window so it decays cleanly

export function rateLimit(limit = 30) {
  return async (c, next) => {
    const ip     = c.req.header('CF-Connecting-IP') ?? 'unknown'
    const bucket = Math.floor(Date.now() / WINDOW_MS)
    const key    = `ratelimit:${ip}:global:${bucket}`

    const count = parseInt(await c.env.KV.get(key) ?? '0', 10)
    if (count >= limit) {
      return c.json({ success: false, data: null, error: 'Rate limit exceeded' }, 429)
    }

    await c.env.KV.put(key, String(count + 1), { expirationTtl: BUCKET_TTL })
    await next()
  }
}

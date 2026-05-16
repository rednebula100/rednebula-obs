export async function adminAuth(c, next) {
  const key = c.req.header('X-Admin-Key')
  if (!key || !c.env.ADMIN_KEY || key !== c.env.ADMIN_KEY) {
    return c.json({ success: false, data: null, error: 'Unauthorized' }, 401)
  }
  await next()
}

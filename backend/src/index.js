import { Hono }      from 'hono'
import { cors }      from 'hono/cors'
import { rateLimit } from './middleware/rateLimit.js'
import { adminAuth } from './middleware/adminAuth.js'
import health        from './routes/health.js'
import projects      from './routes/projects.js'
import views         from './routes/views.js'
import analytics     from './routes/analytics.js'
import admin         from './routes/admin.js'

const app = new Hono()

app.use('*', cors())
app.use('*', rateLimit(30))

app.route('/health',    health)
app.route('/projects',  projects)
app.route('/views',     views)
app.route('/analytics', analytics)

app.use('/admin/*', adminAuth)
app.route('/admin', admin)

export default app

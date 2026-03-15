import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import authRouter from './routes/auth.route.js'
import fileRouter from './routes/file.route.js'

const app = new Hono()

app.use('*', cors())

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.route('/auth', authRouter)
app.route('/files', fileRouter)

const port = process.env.PORT ? parseInt(process.env.PORT) : 8000;

serve({
  fetch: app.fetch,
  port
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})

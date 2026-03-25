import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import authRouter from './routes/auth.route.js'
import fileRouter from './routes/file.route.js'
import notificationRouter from './routes/notification.route.js'
import categoryRouter from './routes/category.route.js'
import productRouter from './routes/product.route.js'

const app = new Hono()

app.use('*', cors())

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.route('/auth', authRouter)
app.route('/files', fileRouter)
app.route('/notifications', notificationRouter)
app.route('/categories', categoryRouter)
app.route('/products', productRouter)

const port = process.env.PORT ? parseInt(process.env.PORT) : 8000;

serve({
  fetch: app.fetch,
  port
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})

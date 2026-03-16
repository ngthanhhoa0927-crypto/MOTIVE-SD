import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import authRouter from './routes/auth.route.js'
import fileRouter from './routes/file.route.js'
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { db } from './db/index.js';

const app = new Hono()

app.use('*', cors())

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.route('/auth', authRouter)
app.route('/files', fileRouter)

const port = process.env.PORT ? parseInt(process.env.PORT) : 8000;

async function startServer() {
  try {
    console.log('Running database migrations...');
    await migrate(db, { migrationsFolder: './drizzle' });
    console.log('Database migrations completed successfully.');
  } catch (error) {
    console.error('Error running database migrations:', error);
    process.exit(1);
  }

  serve({
    fetch: app.fetch,
    port
  }, (info) => {
    console.log(`Server is running on http://localhost:${info.port}`)
  })
}

startServer();

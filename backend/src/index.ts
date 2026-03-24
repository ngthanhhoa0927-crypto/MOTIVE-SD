import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import authRouter from './routes/auth.route.js'
import fileRouter from './routes/file.route.js'
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { db } from './db/index.js';
import { seedData } from './db/seed.js';

import { resolve } from 'path';
import { fileURLToPath } from 'url';

import pg from 'pg';
const { Pool } = pg;

import { execSync } from 'child_process';

const app = new Hono()

app.use('*', cors())

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.route('/auth', authRouter)
app.route('/files', fileRouter)

const port = process.env.PORT ? parseInt(process.env.PORT) : 8000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = resolve(__filename, '..');
const migrationsPath = resolve(process.cwd(), 'drizzle');

async function startServer() {
  try {
    console.log("Ensuring 'public' schema exists using raw pg connection...");
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    await pool.query('CREATE SCHEMA IF NOT EXISTS "public"');

    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'users'
      )
    `);

    if (!tableCheck.rows[0].exists) {
      console.log("Core tables missing. Resetting Drizzle migration history to force a rebuild...");
      await pool.query('DROP SCHEMA IF EXISTS "drizzle" CASCADE');
    }

    await pool.end();

    console.log("Pushing schema to database...");
    try {
      execSync('npx drizzle-kit push --force', { stdio: 'inherit' });
    } catch (e) {
      console.warn('Schema push failed. Proceeding with existing schema.');
    }
    console.log('Database schema sync completed.');

    await seedData();
  } catch (error) {
    console.error('Error in startup sequence:', error);
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

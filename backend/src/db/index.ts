import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import 'dotenv/config';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
});

export const db = drizzle(pool);
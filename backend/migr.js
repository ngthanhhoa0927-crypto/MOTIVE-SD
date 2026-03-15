import { Client } from 'pg';

async function run() {
    const client = new Client({
        connectionString: 'postgresql://admin:secretPasswd@localhost:5432/motiveSD'
    });
    try {
        await client.connect();
        
        await client.query('ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "address" text');
        console.log("Added address column");
        
        await client.query('ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "avatar_url" varchar(500)');
        console.log("Added avatar_url column");
        
    } catch (err) {
        console.error("Migration error:", err);
    } finally {
        await client.end();
    }
}

run();

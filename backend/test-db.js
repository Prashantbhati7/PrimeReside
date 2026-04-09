import { sql } from './src/lib/db.js';

async function testQuery() {
    try {
        console.log("Testing connection...");
        const result = await sql`SELECT * FROM "Tenant" LIMIT 1`;
        console.log("Query success! Result:", result);
    } catch (e) {
        console.error("SQL Error:", e);
    } finally {
        // Need to explicitly close postgres connections or Node won't exit
        if (sql.end) await sql.end();
    }
}

testQuery();

import postgres from 'postgres';
import dotenv from 'dotenv';

dotenv.config();

console.log("Connecting to local database gisdb...");

// Configure for your local PostgreSQL instance
const sql = postgres({
  host: 'localhost',
  port: 5432,
  database: 'gisdb',
  username: 'prashant',
  password: process.env.DB_PASS,
});

export { sql };

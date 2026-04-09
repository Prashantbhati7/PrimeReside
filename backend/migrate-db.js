import { execSync } from 'child_process';
import dotenv from 'dotenv';
import postgres from 'postgres';
import fs from 'fs';

dotenv.config();

const { DATABASE_URL, DB_PASS } = process.env;

async function migrate() {
    console.log("▶️ Step 1: Connecting to local Postgres to ensure 'gisdb' exists...");
    
    // Connect to the default 'postgres' database to create 'gisdb' if it doesn't exist
    const sqlAdmin = postgres({ 
        host: 'localhost', 
        port: 5432, 
        database: 'postgres', 
        username: 'prashant', 
        password: DB_PASS 
    });
    
    try {
        await sqlAdmin`CREATE DATABASE gisdb;`;
        console.log("✅ Created database 'gisdb'");
    } catch (e) {
        if (e.code === '42P04') {
            console.log("✅ Database 'gisdb' already exists.");
        } else {
            console.error("⚠️ Could not create gisdb automatically:", e.message);
            console.log("Continuing anyway, assuming gisdb was manually created...");
        }
    }
    await sqlAdmin.end();

    console.log("\n▶️ Step 2: Enabling PostGIS extension on 'gisdb'...");
    // Connect to gisdb to enable PostGIS
    const sqlDB = postgres({ 
        host: 'localhost', 
        port: 5432, 
        database: 'gisdb', 
        username: 'prashant', 
        password: DB_PASS 
    });
    
    try {
        await sqlDB`CREATE EXTENSION IF NOT EXISTS postgis;`;
        console.log("✅ PostGIS extension enabled.");
    } catch (e) {
        console.error("❌ Failed to enable PostGIS. Make sure the PostGIS extension is installed on your Mac.", e.message);
        process.exit(1);
    }
    await sqlDB.end();

    console.log("\n▶️ Step 3: Exporting data from Neon DB (this might take a minute)...");
    try {
        // Using pg_dump from Homebrew. 
        // --no-owner and --no-privileges prevent local user permission conflicts.
        execSync(`/opt/homebrew/bin/pg_dump "${DATABASE_URL}" --clean --if-exists --no-owner --no-privileges -f dump.sql`);
        console.log("✅ Successfully exported Neon DB to dump.sql");
    } catch (e) {
        console.error("❌ Export failed:", e.message);
        process.exit(1);
    }

    console.log("\n▶️ Step 4: Importing data into local 'gisdb'...");
    try {
        // Using psql to import the sql file locally
        execSync(`/opt/homebrew/bin/psql -h localhost -p 5432 -U prashant -d gisdb -f dump.sql`, {
            env: { ...process.env, PGPASSWORD: DB_PASS },
            stdio: 'pipe'
        });
        console.log("✅ Successfully imported data into local DB!");
    } catch (e) {
        console.error("❌ Import failed:", e.message);
        process.exit(1);
    }

    console.log("\n▶️ Step 5: Cleaning up dump file...");
    if (fs.existsSync('dump.sql')) {
        fs.unlinkSync('dump.sql');
    }
    console.log("🎉 Migration Complete! Your local database is ready to use.");
}

migrate().catch(console.error);

import { sql } from "../lib/db.js";

async function main() {
  try {
    // Try to fetch one property to test connection
    const result = await sql`SELECT count(*) as count FROM "Property"`;
    console.log(`Successfully connected! Found ${result[0].count} properties.`);
  } catch (error) {
    console.error("Error connecting to database:", error);
  }
}

main();

// db.ts or db.js
import "dotenv/config";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "@shared/schema"; // ✅ You can keep this as-is

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set. Did you forget to set up Postgres?");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 60000,
  idleTimeoutMillis: 60000,
  statement_timeout: 60000,
  query_timeout: 60000
});

export const db = drizzle(pool, { schema });
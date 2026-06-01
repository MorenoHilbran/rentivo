/**
 * Rentivo — Drizzle ORM Database Client
 * Menggunakan postgres driver langsung ke Supabase Postgres.
 * Connection string menggunakan Transaction Pooler (port 6543) dari Supabase
 * untuk kompatibilitas serverless Next.js.
 */
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema.js'

export const pool = new Pool({
  connectionString: process.env.SUPABASE_DB_URL,
  // Transaction Pooler mode — cocok untuk serverless
  max: 1,
  idleTimeoutMillis: 0,
  connectionTimeoutMillis: 10000,
})
export const db = drizzle(pool, { schema, logger: process.env.NODE_ENV === 'development' })

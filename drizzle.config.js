import dotenv from 'dotenv'
import { defineConfig } from 'drizzle-kit'

dotenv.config({ path: '.env.local' })
dotenv.config()

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/lib/db/schema.js',
  out: './src/lib/db/migrations',
  dbCredentials: {
    url: process.env.SUPABASE_DB_URL,
  },
  verbose: true,
  strict: true,
})

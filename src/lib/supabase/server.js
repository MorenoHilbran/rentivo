/**
 * Supabase client untuk Server Components, Server Actions, dan Route Handlers.
 * Menggunakan @supabase/ssr createServerClient dengan cookies() dari next/headers.
 */
import { createServerClient } from '@supabase/ssr'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // setAll dipanggil dari Server Component — bisa diabaikan jika
            // ada middleware yang me-refresh session.
          }
        },
      },
    }
  )
}

/**
 * Supabase admin client menggunakan service_role key.
 * HANYA gunakan di Inngest workers dan SuperAdmin operations.
 * JANGAN expose ke client side.
 */
export async function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}

/**
 * Supabase middleware client — digunakan dalam middleware.js untuk
 * me-refresh session sebelum Server Components dirender.
 *
 * Error handling: Jika Supabase tidak bisa diakses (network error, project paused),
 * getUser() akan gagal secara graceful sehingga user diredirect ke /login.
 */
import { createServerClient } from '@supabase/ssr'

export function createMiddlewareClient(request, response) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
      global: {
        // Timeout 8 detik agar middleware tidak hang lama saat Supabase tidak bisa diakses
        fetch: (url, options) => {
          const controller = new AbortController()
          const timeout = setTimeout(() => controller.abort(), 8000)
          return fetch(url, { ...options, signal: controller.signal }).finally(() =>
            clearTimeout(timeout)
          )
        },
      },
    }
  )
}

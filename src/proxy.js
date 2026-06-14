/**
 * Rentivo — Proxy (formerly middleware)
 * ========================================
 * Next.js 16: middleware.js has been renamed to proxy.js
 * The exported function must be named `proxy` (not `middleware`).
 *
 * Tugas:
 * 1. Refresh session Supabase (agar cookie auth tetap valid)
 * 2. Guard rute berdasarkan status autentikasi dan role
 *
 * Error handling:
 * Jika Supabase tidak bisa diakses (project paused, ENOTFOUND, timeout),
 * getUser() akan throw atau return null. Dalam kasus ini, rute publik
 * tetap bisa diakses, rute protected diarahkan ke /login.
 */
import { NextResponse } from 'next/server'
import { createMiddlewareClient } from '@/lib/supabase/middleware'

// Rute publik yang tidak memerlukan autentikasi
const PUBLIC_ROUTES = ['/', '/login', '/register']

// Rute SuperAdmin — hanya untuk role superadmin
const SUPERADMIN_ROUTES = ['/superadmin']

export async function proxy(request) {
  const { pathname } = request.nextUrl

  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Refresh session Supabase agar tidak expired
  // Wrapped dalam try-catch agar tidak crash saat Supabase tidak tersedia
  let user = null
  try {
    const supabase = createMiddlewareClient(request, response)
    const { data, error } = await supabase.auth.getUser()
    if (!error) {
      user = data?.user ?? null
    }
  } catch (err) {
    // Supabase tidak bisa diakses (ENOTFOUND, timeout, dll)
    // Log singkat tanpa spam, lanjutkan dengan user = null
    if (process.env.NODE_ENV === 'development') {
      const msg = err?.message ?? String(err)
      // Hanya log sekali per jenis error agar tidak spam
      if (!msg.includes('ENOTFOUND') && !msg.includes('AbortError')) {
        console.warn('[Proxy] Supabase auth check failed:', msg)
      }
    }
  }

  // Izinkan akses ke rute publik tanpa auth
  const isPublic = PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + '/')
  )

  if (isPublic) {
    // Jika sudah login dan mencoba akses /login atau /register, redirect ke dashboard
    if (user && (pathname === '/login' || pathname.startsWith('/register'))) {
      const role = user.user_metadata?.role
      if (role === 'superadmin') {
        return NextResponse.redirect(new URL('/superadmin', request.url))
      }
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return response
  }

  // Jika belum login (atau Supabase tidak tersedia), redirect ke /login
  if (!user) {
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  const role = user.user_metadata?.role

  // Guard rute SuperAdmin
  if (SUPERADMIN_ROUTES.some((r) => pathname.startsWith(r))) {
    if (role !== 'superadmin') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  // Guard rute Staff — staff hanya bisa akses /returns dan /api
  if (role === 'staff') {
    const allowedForStaff = ['/returns', '/api']
    if (!allowedForStaff.some((r) => pathname.startsWith(r))) {
      return NextResponse.redirect(new URL('/returns', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match semua request path kecuali:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, robots.txt, sitemap.xml
     * - File-file dengan ekstensi umum
     */
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}

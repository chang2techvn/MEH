import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // Skip middleware checks for auth routes to avoid infinite loops
  if (request.nextUrl.pathname.startsWith('/auth/')) {
    return response
  }

  // Protected routes that require authentication
  const protectedRoutes = [
    '/admin',
    '/groups/create', 
    '/messages',
    '/challenges',
    '/community',
    '/resources'
  ]

  // Check if the current path is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  )

  if (isProtectedRoute) {
    try {
      // Get authenticated user from supabase auth
      const { data: { user }, error } = await supabase.auth.getUser()
      
      // If no authenticated user or auth error, redirect to login
      if (!user || error) {
        const redirectUrl = new URL('/auth/login', request.url)
        redirectUrl.searchParams.set('redirect', request.nextUrl.pathname)
        return NextResponse.redirect(redirectUrl)
      }

      // Get user data from database for all protected routes
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role, account_status, is_active')
        .eq('id', user.id)
        .single()

      if (userError || !userData) {
        const redirectUrl = new URL('/auth/login', request.url)
        redirectUrl.searchParams.set('redirect', request.nextUrl.pathname)
        return NextResponse.redirect(redirectUrl)
      }

      // Check account status for all protected routes
      if (userData.account_status !== 'approved' || !userData.is_active) {
        const redirectUrl = new URL('/auth/login', request.url)
        redirectUrl.searchParams.set('message', 'account_not_approved')
        return NextResponse.redirect(redirectUrl)
      }

      // Additional check for admin routes only
      if (request.nextUrl.pathname.startsWith('/admin')) {
        // Check admin role
        if (userData.role !== 'admin') {
          return NextResponse.redirect(new URL('/', request.url))
        }
      }
    } catch (error) {
      console.error('Middleware error:', error)
      // On error, redirect to login for protected routes
      const redirectUrl = new URL('/auth/login', request.url)
      redirectUrl.searchParams.set('redirect', request.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }
  }

  // Add security headers
  const securityHeaders = {
    "X-DNS-Prefetch-Control": "on",
    "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
    "X-XSS-Protection": "1; mode=block",
    "X-Frame-Options": "SAMEORIGIN",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  }

  // Set security headers
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  // Add caching headers for static assets
  const url = request.nextUrl.pathname
  if (
    url.includes("/images/") ||
    url.includes("/fonts/") ||
    url.includes("/videos/") ||
    url.endsWith(".jpg") ||
    url.endsWith(".jpeg") ||
    url.endsWith(".png") ||
    url.endsWith(".webp") ||
    url.endsWith(".svg") ||
    url.endsWith(".css") ||
    url.endsWith(".js")
  ) {
    // Cache static assets for 1 year
    response.headers.set("Cache-Control", "public, max-age=31536000, immutable")
  } else if (url.includes("/_next/static/")) {
    // Cache Next.js static assets for 1 year
    response.headers.set("Cache-Control", "public, max-age=31536000, immutable")
  } else if (url.includes("/_next/image")) {
    // Cache Next.js optimized images for 1 week
    response.headers.set("Cache-Control", "public, max-age=604800, stale-while-revalidate=86400")
  } else if (url.includes("/api/")) {
    // No caching for API routes
    response.headers.set("Cache-Control", "no-store, max-age=0")
  } else {
    // Default caching for other routes - 5 minutes with stale-while-revalidate
    response.headers.set("Cache-Control", "public, max-age=300, stale-while-revalidate=60")
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}

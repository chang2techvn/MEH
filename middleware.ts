import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Helper function to check admin role with service key
async function checkAdminRole(userId: string): Promise<boolean> {
  try {
    // Create service client with service key for admin checks
    const serviceClient = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          get() { return undefined },
          set() {},
          remove() {},
        },
      }
    )

    const { data, error } = await serviceClient
      .from('users')
      .select('role')
      .eq('id', userId)
      .maybeSingle()

    if (error || !data) {
      console.log('❌ Admin check failed:', error?.message)
      return false
    }

    return data.role === 'admin'
  } catch (error) {
    console.error('❌ Admin check error:', error)
    return false
  }
}

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

  // Handle auth routes - redirect to home if already logged in
  if (request.nextUrl.pathname.startsWith('/auth/')) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      // If user is already logged in, redirect to home
      if (user) {
        console.log('✅ Middleware: User already logged in, redirecting to home from auth route')
        return NextResponse.redirect(new URL('/', request.url))
      }
      
      // If no user, allow access to auth routes
      return response
    } catch (error) {
      console.error('❌ Middleware auth route error:', error)
      // On error, allow access to auth routes
      return response
    }
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
      
      console.log('🔍 Middleware Debug:', {
        path: request.nextUrl.pathname,
        hasUser: !!user,
        userEmail: user?.email,
        error: error?.message
      })
      
      // If no authenticated user or auth error, redirect to login
      if (!user || error) {
        console.log('❌ Middleware: No user or auth error, redirecting to login')
        const redirectUrl = new URL('/auth/login', request.url)
        redirectUrl.searchParams.set('redirect', request.nextUrl.pathname)
        return NextResponse.redirect(redirectUrl)
      }

      // For admin routes, check admin role
      if (request.nextUrl.pathname.startsWith('/admin')) {
        const adminCheck = await checkAdminRole(user.id)
        if (!adminCheck) {
          console.log('❌ Middleware: User not admin, redirecting to home')
          return NextResponse.redirect(new URL('/', request.url))
        }
        console.log('✅ Middleware: Admin access granted')
      }
      
      console.log('✅ Middleware: Access granted for protected route')
      
    } catch (error) {
      console.error('❌ Middleware error:', error)
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

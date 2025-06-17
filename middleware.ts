import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const res = NextResponse.next()
  
  // Create a Supabase client configured to use cookies
  const supabase = createMiddlewareClient({ req: request, res })

  // Refresh session if expired - required for Server Components
  const { data: { session } } = await supabase.auth.getSession()
  // Protected routes that require authentication
  const protectedRoutes = [
    '/profile',
    '/admin',
    '/groups/create',
    '/messages'
  ]

  // Check if the current path is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  )

  // Redirect to login if accessing protected route without session
  if (isProtectedRoute && !session) {
    const redirectUrl = new URL('/auth/login', request.url)
    redirectUrl.searchParams.set('redirect', request.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }
  // Admin routes - additional check for admin role
  if (request.nextUrl.pathname.startsWith('/admin') && session) {
    try {
      const { data: user } = await supabase
        .from('users')
        .select('role')
        .eq('id', session.user.id)
        .single()

      if (!user || user.role !== 'admin') {
        return NextResponse.redirect(new URL('/', request.url))
      }
    } catch (error) {
      console.error('Error checking admin role:', error)
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  const response = res
  // Add security headers (CSP disabled temporarily for debugging)
  const securityHeaders = {
    "X-DNS-Prefetch-Control": "on",
    "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
    "X-XSS-Protection": "1; mode=block",
    "X-Frame-Options": "SAMEORIGIN",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=(), interest-cohort=()",
    // CSP disabled temporarily for debugging
    // "Content-Security-Policy":
    //    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://analytics.englishmastery.com https://www.youtube.com https://s.ytimg.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https:; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' http://localhost:3000 https://yvsjynosfwyhvisqhasp.supabase.co wss://yvsjynosfwyhvisqhasp.supabase.co; frame-src 'self' https://www.youtube.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'self'; upgrade-insecure-requests;",
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

  // Add compression
  response.headers.set("Accept-Encoding", "gzip, deflate, br")

  // Add early hints for critical resources
  if (url === "/" || url === "") {
    response.headers.set(
      "Link",
      [
        "</fonts/outfit-var.woff2>; rel=preload; as=font; type=font/woff2; crossorigin=anonymous",
        "</images/hero-bg.webp>; rel=preload; as=image",
        "</_next/static/css/app.css>; rel=preload; as=style",
        "<https://fonts.googleapis.com>; rel=preconnect",
        "<https://fonts.gstatic.com>; rel=preconnect; crossorigin=anonymous",
      ].join(", "),
    )
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

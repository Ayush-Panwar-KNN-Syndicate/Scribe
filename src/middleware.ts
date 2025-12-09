import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { isAdmin } from '@/lib/admin'

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
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const path = request.nextUrl.pathname
  const isAuthPage = path.startsWith('/login') || path.startsWith('/signup')
  // Check if route requires authentication
  const isProtectedRoute = path.startsWith('/articles') || path.startsWith('/dashboard') || path === '/'
  // Check if route requires admin access
  const isAdminRoute = path.startsWith('/static-pages')
  // If user is authenticated and trying to access auth pages, redirect to articles
  if (user && isAuthPage) {
    const redirectUrl = new URL('/articles', request.url)
    return NextResponse.redirect(redirectUrl)
  }
  
  // If user is authenticated and visiting root, redirect to articles
  if (user && path === '/') {
    const redirectUrl = new URL('/articles', request.url)
    return NextResponse.redirect(redirectUrl)
  }
  
  // If user is not authenticated and trying to access protected routes, redirect to login
  if (!user && isProtectedRoute) {
    const redirectUrl = new URL('/login', request.url)
    // Add the intended destination as a search parameter
    redirectUrl.searchParams.set('redirectTo', path)
    return NextResponse.redirect(redirectUrl)
  }

  // If user is authenticated but trying to access admin routes without admin privileges
  if (user && isAdminRoute && !isAdmin()) {
    const redirectUrl = new URL('/articles', request.url)
    redirectUrl.searchParams.set('error', 'Admin access required')
    return NextResponse.redirect(redirectUrl)
  }
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - auth (authentication routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api routes (unless we want to protect them)
     */
    '/((?!auth|_next/static|_next/image|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
} 
 
 
 
 
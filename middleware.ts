import { getToken } from 'next-auth/jwt'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET 
  })

  const { pathname } = request.nextUrl

  // Public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/auth/patient/login',
    '/auth/patient/signup',
    '/auth/doctor/login', 
    '/auth/doctor/signup',
    '/auth/hospital/login',
    '/auth/hospital/signup',
    '/auth/patient/verify-otp',
    '/auth/hospital/verify-otp',
    '/api/patients/register',
    '/api/doctors/register',
    '/api/hospitals/register',
    '/api/auth',
    '/api/test'
  ]

  // Check if the current path is a public route
  const isPublicRoute = publicRoutes.some(route => 
    pathname.startsWith(route)
  )

  // If it's a public route, allow access
  if (isPublicRoute) {
    return NextResponse.next()
  }

  // If user is not authenticated and trying to access protected route
  if (!token) {
    const loginUrl = new URL('/', request.url)
    return NextResponse.redirect(loginUrl)
  }

  // Role-based route protection
  const userRole = token.role

  // Patient routes
  if (pathname.startsWith('/patient') && userRole !== 'patient') {
    const homeUrl = new URL('/', request.url)
    return NextResponse.redirect(homeUrl)
  }

  // Hospital/Doctor routes (both can access hospital portal)
  if (pathname.startsWith('/hospital') && 
      userRole !== 'hospital' && 
      userRole !== 'doctor') {
    const homeUrl = new URL('/', request.url)
    return NextResponse.redirect(homeUrl)
  }

  // API route protection
  if (pathname.startsWith('/api/patients') && 
      !pathname.includes('register') &&
      userRole !== 'patient' && 
      userRole !== 'doctor' && 
      userRole !== 'hospital') {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  if (pathname.startsWith('/api/doctors') && 
      !pathname.includes('register') &&
      userRole !== 'doctor' && 
      userRole !== 'hospital') {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  if (pathname.startsWith('/api/hospitals') && 
      !pathname.includes('register') &&
      userRole !== 'hospital') {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

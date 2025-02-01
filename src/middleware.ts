import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { Database } from '@/types/supabase'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient<Database>({ req, res })
  
  // Get the tenant from the hostname
  const hostname = req.headers.get('host') || ''
  const searchParams = req.nextUrl.searchParams
  const tenantSlug = hostname.split('.')[0]
  
  // Check if we're on a custom domain
  const currentUser = await supabase.auth.getUser()
  
  // If no session, only allow access to public routes
  if (!currentUser.data?.user) {
    const isPublicRoute = req.nextUrl.pathname.startsWith('/auth') || 
      req.nextUrl.pathname === '/' ||
      req.nextUrl.pathname.startsWith('/_next') ||
      req.nextUrl.pathname.startsWith('/api/public')
      
    if (!isPublicRoute) {
      return NextResponse.redirect(new URL('/auth/signin', req.url))
    }
    return res
  }
  
  // Get tenant info and verify access
  const { data: tenant } = await supabase
    .from('tenants')
    .select('id, slug')
    .eq('slug', tenantSlug)
    .single()
    
  if (!tenant) {
    return NextResponse.redirect(new URL('/404', req.url))
  }
  
  // Verify user has access to this tenant
  const { data: tenantUser } = await supabase
    .from('tenant_users')
    .select('role')
    .eq('tenant_id', tenant.id)
    .eq('user_id', currentUser.data.user.id)
    .single()
    
  if (!tenantUser) {
    return NextResponse.redirect(new URL('/auth/unauthorized', req.url))
  }
  
  // Add tenant and role context to requests
  req.headers.set('x-tenant-id', tenant.id)
  req.headers.set('x-tenant-slug', tenant.slug)
  req.headers.set('x-tenant-role', tenantUser.role)
  
  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}
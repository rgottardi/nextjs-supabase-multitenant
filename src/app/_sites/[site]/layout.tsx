import { createServerClient, validateTenantAccess } from '@/lib/tenant-server'
import { redirect } from 'next/navigation'

export default async function TenantLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { site: string }
}) {
  const supabase = createServerClient()
  
  const {
    data: { session },
  } = await supabase.auth.getSession()
  
  const tenantAccess = await validateTenantAccess(
    params.site,
    session?.user?.id
  )
  
  if (!tenantAccess) {
    redirect('/auth/signin')
  }
  
  return (
    <div className="min-h-screen bg-background">
      {/* Add tenant-specific layout components here */}
      {children}
    </div>
  )
}
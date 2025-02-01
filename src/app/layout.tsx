import { GeistSans } from 'geist/font/sans'
import { TenantProvider } from '@/components/providers/TenantProvider'
import { createServerClient, getTenant } from '@/lib/tenant-server'
import { headers } from 'next/headers'
import '@/styles/globals.css'

export const metadata = {
  title: process.env.NEXT_PUBLIC_APP_NAME,
  description: 'Multi-tenant application platform',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createServerClient()
  const headersList = headers()
  const hostName = headersList.get('host') || ''
  const tenantSlug = hostName.split('.')[0]

  // Get current session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Get tenant if we're on a tenant subdomain
  const tenant = tenantSlug ? await getTenant(tenantSlug) : null

  return (
    <html lang="en" className={GeistSans.className}>
      <body className="bg-background min-h-screen text-foreground">
        <TenantProvider initialTenant={tenant} initialUser={session?.user || null}>
          {children}
        </TenantProvider>
      </body>
    </html>
  )
}
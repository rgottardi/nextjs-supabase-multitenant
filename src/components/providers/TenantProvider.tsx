'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { TenantContext, TenantContextType, getTenantUrl } from '@/utils/tenant-context'
import { Database } from '@/types/supabase'

export function TenantProvider({
  children,
  initialTenant,
  initialUser,
}: {
  children: React.ReactNode
  initialTenant?: Database['shared']['Tables']['tenants']['Row']
  initialUser?: any
}) {
  const supabase = createClientComponentClient<Database>()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [tenant, setTenant] = useState(initialTenant || null)
  const [user, setUser] = useState(initialUser || null)
  const [role, setRole] = useState<TenantContextType['role']>(null)

  useEffect(() => {
    const initialize = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session?.user) {
          setIsLoading(false)
          return
        }

        // Get current tenant from URL
        const hostname = window.location.hostname
        const tenantSlug = hostname.split('.')[0]

        if (!tenantSlug) {
          setIsLoading(false)
          return
        }

        // Fetch tenant and role
        const { data: tenant } = await supabase
          .from('tenants')
          .select('*')
          .eq('slug', tenantSlug)
          .single()

        if (tenant) {
          const { data: tenantUser } = await supabase
            .from('tenant_users')
            .select('role')
            .eq('tenant_id', tenant.id)
            .eq('user_id', session.user.id)
            .single()

          setTenant(tenant)
          setUser(session.user)
          setRole(tenantUser?.role || null)
        }

        setIsLoading(false)
      } catch (error) {
        console.error('Error initializing tenant context:', error)
        setIsLoading(false)
      }
    }

    initialize()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null)
        setTenant(null)
        setRole(null)
        router.push('/auth/signin')
      } else if (event === 'SIGNED_IN') {
        setUser(session?.user || null)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, router])

  const switchTenant = async (tenantSlug: string) => {
    try {
      const { data: newTenant } = await supabase
        .from('tenants')
        .select('*')
        .eq('slug', tenantSlug)
        .single()

      if (newTenant) {
        window.location.href = getTenantUrl(tenantSlug)
      }
    } catch (error) {
      console.error('Error switching tenant:', error)
      throw error
    }
  }

  const value: TenantContextType = {
    tenant,
    user,
    role,
    isLoading,
    switchTenant,
  }

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>
}
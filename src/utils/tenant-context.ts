import { createContext, useContext } from 'react'
import { User } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

export type TenantRole = 'owner' | 'admin' | 'member'

export interface TenantContextType {
  tenant: Database['shared']['Tables']['tenants']['Row'] | null
  user: User | null
  role: TenantRole | null
  isLoading: boolean
  switchTenant: (tenantSlug: string) => Promise<void>
}

export const TenantContext = createContext<TenantContextType>({
  tenant: null,
  user: null,
  role: null,
  isLoading: true,
  switchTenant: async () => {},
})

export const useTenant = () => {
  const context = useContext(TenantContext)
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider')
  }
  return context
}

export const getTenantUrl = (tenantSlug: string, path = '') => {
  if (process.env.NEXT_PUBLIC_VERCEL_ENV === 'production') {
    return `https://${tenantSlug}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}${path}`
  }
  // For local development
  return `http://${tenantSlug}.localhost:3000${path}`
}

export const extractTenantFromUrl = (url: string): string | null => {
  try {
    const hostname = new URL(url).hostname
    const parts = hostname.split('.')
    if (parts.length < 2) return null
    return parts[0]
  } catch {
    return null
  }
}
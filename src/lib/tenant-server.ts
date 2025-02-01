import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { cache } from 'react'
import { Database } from '@/types/supabase'

export const createServerClient = cache(() => {
  const cookieStore = cookies()
  return createServerComponentClient<Database>({ cookies: () => cookieStore })
})

export async function getTenant(tenantSlug: string) {
  const supabase = createServerClient()
  
  const { data: tenant } = await supabase
    .from('tenants')
    .select('*')
    .eq('slug', tenantSlug)
    .single()
    
  return tenant
}

export async function getTenantUser(tenantId: string, userId: string) {
  const supabase = createServerClient()
  
  const { data: tenantUser } = await supabase
    .from('tenant_users')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('user_id', userId)
    .single()
    
  return tenantUser
}

export async function createTenant({
  name,
  slug,
  userId,
}: {
  name: string
  slug: string
  userId: string
}) {
  const supabase = createServerClient()
  
  // Create tenant
  const { data: tenant, error: tenantError } = await supabase
    .from('tenants')
    .insert({ name, slug })
    .select()
    .single()
    
  if (tenantError) throw tenantError
  
  // Add user as owner
  const { error: userError } = await supabase
    .from('tenant_users')
    .insert({
      tenant_id: tenant.id,
      user_id: userId,
      role: 'owner',
    })
    
  if (userError) throw userError
  
  // Clone schema for new tenant
  const { error: schemaError } = await supabase.rpc('clone_tenant_schema', {
    tenant_id: tenant.id,
  })
  
  if (schemaError) throw schemaError
  
  return tenant
}

export async function addTenantUser({
  tenantId,
  email,
  role = 'member',
}: {
  tenantId: string
  email: string
  role?: 'owner' | 'admin' | 'member'
}) {
  const supabase = createServerClient()
  
  // Get or create user
  const { data: user, error: userError } = await supabase
    .from('users')
    .select()
    .eq('email', email)
    .single()
    
  if (userError && userError.code !== 'PGRST116') {
    throw userError
  }
  
  let userId = user?.id
  
  if (!userId) {
    // Create new user
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert({ email })
      .select()
      .single()
      
    if (createError) throw createError
    userId = newUser.id
  }
  
  // Add user to tenant
  const { error: memberError } = await supabase
    .from('tenant_users')
    .insert({
      tenant_id: tenantId,
      user_id: userId,
      role,
    })
    
  if (memberError) throw memberError
  
  return { userId }
}

export async function getUserTenants(userId: string) {
  const supabase = createServerClient()
  
  const { data: tenants } = await supabase
    .from('tenant_users')
    .select(`
      role,
      tenant:tenants (
        id,
        name,
        slug
      )
    `)
    .eq('user_id', userId)
    
  return tenants?.map(({ tenant, role }) => ({
    ...tenant,
    role,
  })) || []
}

export async function validateTenantAccess(
  tenantSlug: string,
  userId?: string
): Promise<{
  tenant: Database['shared']['Tables']['tenants']['Row']
  role: string
} | null> {
  if (!userId) return null
  
  const tenant = await getTenant(tenantSlug)
  if (!tenant) return null
  
  const tenantUser = await getTenantUser(tenant.id, userId)
  if (!tenantUser) return null
  
  return {
    tenant,
    role: tenantUser.role,
  }
}
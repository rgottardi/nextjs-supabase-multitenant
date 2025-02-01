'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { getUserTenants } from '@/lib/tenant-server'
import { getTenantUrl } from '@/utils/tenant-context'
import { Database } from '@/types/supabase'
import { Loader2, Plus, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function Home() {
  const supabase = createClientComponentClient<Database>()
  const [user, setUser] = useState<any>(null)
  const [tenants, setTenants] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showNewTenant, setShowNewTenant] = useState(false)

  useEffect(() => {
    const initialize = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session?.user) {
          setLoading(false)
          return
        }

        setUser(session.user)
        const tenantsData = await getUserTenants(session.user.id)
        setTenants(tenantsData)
      } catch (err) {
        console.error('Error fetching user data:', err)
        setError('Failed to load your workspaces.')
      } finally {
        setLoading(false)
      }
    }

    initialize()
  }, [supabase])

  async function handleCreateTenant(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setLoading(true)

    const formData = new FormData(event.currentTarget)
    const name = formData.get('name') as string
    const slug = formData.get('slug') as string

    try {
      // Create tenant
      const { data: tenant, error: createError } = await supabase
        .from('tenants')
        .insert({ name, slug })
        .select()
        .single()

      if (createError) throw createError

      // Add current user as owner
      const { error: memberError } = await supabase
        .from('tenant_users')
        .insert({
          tenant_id: tenant.id,
          user_id: user.id,
          role: 'owner',
        })

      if (memberError) throw memberError

      // Create tenant schema
      const { error: schemaError } = await supabase.rpc('clone_tenant_schema', {
        tenant_id: tenant.id,
      })

      if (schemaError) throw schemaError

      // Redirect to new tenant
      window.location.href = getTenantUrl(tenant.slug)
    } catch (err) {
      console.error('Error creating tenant:', err)
      setError('Failed to create workspace. Please try again.')
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <h1 className="text-4xl font-bold mb-8">Welcome to {process.env.NEXT_PUBLIC_APP_NAME}</h1>
        <a
          href="/auth/signin"
          className="px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Sign In to Get Started
        </a>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Your Workspaces</h1>
          <button
            onClick={() => setShowNewTenant(true)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Workspace
          </button>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {showNewTenant ? (
          <div className="bg-card rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Create New Workspace</h2>
            <form onSubmit={handleCreateTenant} className="space-y-4">
              <div>
                <label htmlFor="name" className="text-sm font-medium">
                  Workspace Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="w-full px-3 py-2 border rounded-md mt-1"
                  placeholder="My Awesome Workspace"
                />
              </div>

              <div>
                <label htmlFor="slug" className="text-sm font-medium">
                  Workspace URL
                </label>
                <div className="flex items-center mt-1">
                  <input
                    id="slug"
                    name="slug"
                    type="text"
                    required
                    pattern="[a-z0-9-]+"
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="my-workspace"
                  />
                  <span className="ml-2 text-muted-foreground">
                    .{process.env.NEXT_PUBLIC_ROOT_DOMAIN}
                  </span>
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowNewTenant(false)}
                  className="px-4 py-2 border rounded-md hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Create Workspace'
                  )}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {tenants.map((tenant) => (
              <a
                key={tenant.id}
                href={getTenantUrl(tenant.slug)}
                className="block bg-card rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <h3 className="text-xl font-semibold mb-2">{tenant.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {tenant.slug}.{process.env.NEXT_PUBLIC_ROOT_DOMAIN}
                </p>
                <div className="mt-4">
                  <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-1 rounded">
                    {tenant.role}
                  </span>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
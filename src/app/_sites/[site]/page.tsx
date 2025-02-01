'use client'

import { useTenant } from '@/utils/tenant-context'
import { useTenantData } from '@/hooks/useTenantData'

export default function TenantHome() {
  const { tenant, user, role } = useTenant()
  const { data: projects, loading } = useTenantData('projects')

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{tenant?.name} Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.email} ({role})
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Stats Cards */}
        <div className="bg-card rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-medium mb-2">Active Projects</h3>
          <p className="text-3xl font-bold">
            {projects?.filter((p: any) => p.status === 'active').length || 0}
          </p>
        </div>

        <div className="bg-card rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-medium mb-2">Completed Projects</h3>
          <p className="text-3xl font-bold">
            {projects?.filter((p: any) => p.status === 'completed').length || 0}
          </p>
        </div>

        <div className="bg-card rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-medium mb-2">Team Members</h3>
          <p className="text-3xl font-bold">
            {/* This would need a separate query for team members */}
            --
          </p>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Recent Projects</h2>
        <div className="bg-card rounded-lg shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left px-6 py-3">Name</th>
                <th className="text-left px-6 py-3">Status</th>
                <th className="text-left px-6 py-3">Created</th>
                <th className="text-right px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects?.slice(0, 5).map((project: any) => (
                <tr key={project.id} className="border-b last:border-0 hover:bg-muted/50">
                  <td className="px-6 py-4">{project.name}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      project.status === 'active' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {project.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {new Date(project.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-sm text-primary hover:text-primary/80">
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
              {(!projects || projects.length === 0) && (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-muted-foreground">
                    No projects found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
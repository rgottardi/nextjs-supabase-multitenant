'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useTenant } from '@/utils/tenant-context'
import { Database } from '@/types/supabase'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Loader2, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface ProjectSettingsProps {
  project: any
  onUpdate?: () => void
  onDelete?: () => void
}

export function ProjectSettings({ project, onUpdate, onDelete }: ProjectSettingsProps) {
  const supabase = createClientComponentClient<Database>()
  const { tenant, role } = useTenant()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  
  const canDelete = role === 'owner' || role === 'admin'
  
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError(null)
    
    const formData = new FormData(event.currentTarget)
    const updates = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      status: formData.get('status') as 'active' | 'completed' | 'archived',
    }
    
    try {
      const { error: updateError } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', project.id)
        .eq('tenant_id', tenant?.id)
        
      if (updateError) throw updateError
      
      onUpdate?.()
    } catch (err) {
      setError('Failed to update project. Please try again.')
      console.error('Error updating project:', err)
    } finally {
      setLoading(false)
    }
  }
  
  async function handleDelete() {
    setLoading(true)
    setError(null)
    
    try {
      const { error: deleteError } = await supabase
        .from('projects')
        .delete()
        .eq('id', project.id)
        .eq('tenant_id', tenant?.id)
        
      if (deleteError) throw deleteError
      
      setShowDeleteDialog(false)
      onDelete?.()
    } catch (err) {
      setError('Failed to delete project. Please try again.')
      console.error('Error deleting project:', err)
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium">
            Project Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            defaultValue={project.name}
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="description" className="text-sm font-medium">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            defaultValue={project.description}
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="status" className="text-sm font-medium">
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={project.status}
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="archived">Archived</option>
          </select>
        </div>
        
        <div className="flex justify-between">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Save Changes'
            )}
          </button>
          
          {canDelete && (
            <button
              type="button"
              onClick={() => setShowDeleteDialog(true)}
              className="px-4 py-2 text-sm bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90"
            >
              Delete Project
            </button>
          )}
        </div>
      </form>
      
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the project
              and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Delete Project'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
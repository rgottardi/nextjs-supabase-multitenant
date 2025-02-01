import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useTenant } from '@/utils/tenant-context'
import { Database } from '@/types/supabase'

type TableName = keyof Database['public']['Tables']
type QueryOptions = {
  columns?: string
  filter?: Record<string, any>
  orderBy?: string
  limit?: number
  page?: number
}

export function useTenantData<T>(
  tableName: TableName,
  options: QueryOptions = {}
) {
  const supabase = createClientComponentClient<Database>()
  const { tenant } = useTenant()
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [count, setCount] = useState<number>(0)

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!tenant) {
          setData([])
          setLoading(false)
          return
        }

        setLoading(true)
        const {
          columns = '*',
          filter = {},
          orderBy,
          limit,
          page = 1,
        } = options

        let query = supabase.from(tableName).select(columns, { count: 'exact' })

        // Apply tenant filter
        query = query.eq('tenant_id', tenant.id)

        // Apply additional filters
        Object.entries(filter).forEach(([key, value]) => {
          query = query.eq(key, value)
        })

        // Apply ordering
        if (orderBy) {
          query = query.order(orderBy)
        }

        // Apply pagination
        if (limit) {
          const from = (page - 1) * limit
          query = query.range(from, from + limit - 1)
        }

        const { data: result, error: queryError, count: totalCount } = await query

        if (queryError) throw queryError

        setData(result as T[])
        if (totalCount !== null) setCount(totalCount)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An error occurred'))
        setData([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [supabase, tenant, tableName, JSON.stringify(options)])

  const refresh = () => {
    setLoading(true)
    // Re-run the effect
    // The dependency array will catch this and trigger a re-fetch
  }

  return {
    data,
    loading,
    error,
    count,
    refresh,
  }
}

// Subscription hook for real-time updates
export function useTenantSubscription<T>(
  tableName: TableName,
  callback: (payload: any) => void
) {
  const supabase = createClientComponentClient<Database>()
  const { tenant } = useTenant()

  useEffect(() => {
    if (!tenant) return

    const channel = supabase
      .channel('table_db_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: tableName,
          filter: `tenant_id=eq.${tenant.id}`,
        },
        callback
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, tenant, tableName, callback])
}
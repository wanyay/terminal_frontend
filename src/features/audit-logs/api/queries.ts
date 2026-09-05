import { useQuery } from '@tanstack/react-query'
import axiosClient from '@/lib/api/axiosClient'

// --- Types ---

export interface AuditLog {
  id: string
  userId: string
  username: string
  action: string
  module: string
  ipAddress: string | null
  userAgent: string | null
  oldValues: Record<string, unknown> | null
  newValues: Record<string, unknown> | null
  createdAt: string
}

export interface AuditLogsMeta {
  page: number
  perPage: number
  total: number
  totalPages: number
}

export interface AuditLogsResponse {
  data: AuditLog[]
  meta: AuditLogsMeta
}

export interface AuditLogFilters {
  page?: number
  perPage?: number
  search?: string
  sortBy?: string
  sortOrder?: 'ASC' | 'DESC'
  from?: string
  to?: string
  action?: string
  module?: string
  userId?: string
  username?: string
}

// --- Query Keys ---

export const auditLogsKeys = {
  all: ['audit-logs'] as const,
  list: (params: AuditLogFilters) => ['audit-logs', 'list', params] as const,
}

// --- Fetch Audit Logs (server-side pagination) ---

export function useAuditLogs(params: AuditLogFilters) {
  const queryParams = new URLSearchParams()

  if (params.page) queryParams.set('page', String(params.page))
  if (params.perPage) queryParams.set('perPage', String(params.perPage))
  if (params.search) queryParams.set('search', params.search)
  if (params.sortBy) queryParams.set('sortBy', params.sortBy)
  if (params.sortOrder) queryParams.set('sortOrder', params.sortOrder)
  if (params.from) queryParams.set('from', params.from)
  if (params.to) queryParams.set('to', params.to)
  if (params.action) queryParams.set('action', params.action)
  if (params.module) queryParams.set('module', params.module)
  if (params.userId) queryParams.set('userId', params.userId)
  if (params.username) queryParams.set('username', params.username)

  return useQuery<AuditLogsResponse>({
    queryKey: auditLogsKeys.list(params),
    queryFn: async () => {
      const res = await axiosClient.get<AuditLog[]>(
        `/api/v1/audit-logs?${queryParams.toString()}`
      )
      const logs = res.data as AuditLog[] & {
        meta?: AuditLogsMeta
      }

      return {
        data: logs,
        meta: logs.meta ?? {
          page: 1,
          perPage: 20,
          total: 0,
          totalPages: 0,
        },
      }
    },
  })
}

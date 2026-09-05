import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import axiosClient from '@/lib/api/axiosClient'
import { getT } from '@/lib/i18n'

// --- Types ---

export interface BlacklistEntry {
  id: string
  type: 'license_plate' | 'nrc_passport'
  value: string
  reason: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
  createdBy: string | null
  updatedBy: string | null
}

interface BlacklistResponse {
  data: BlacklistEntry[]
  meta: {
    page: number
    perPage: number
    total: number
    totalPages: number
  }
}

export interface BlacklistPayload {
  type: 'license_plate' | 'nrc_passport'
  value: string
  reason?: string
}

// --- Query Keys ---

export const blacklistKeys = {
  all: ['blacklist'] as const,
  list: (params?: Record<string, unknown>) =>
    ['blacklist', 'list', params] as const,
}

// --- Fetch All Blacklist Entries (server-side pagination) ---

export function useBlacklist(params: {
  page?: number
  perPage?: number
  search?: string
  sortBy?: string
  sortOrder?: 'ASC' | 'DESC'
}) {
  const queryParams = new URLSearchParams()
  if (params.page) queryParams.set('page', String(params.page))
  if (params.perPage) queryParams.set('perPage', String(params.perPage))
  if (params.search) queryParams.set('search', params.search)
  if (params.sortBy) queryParams.set('sortBy', params.sortBy)
  if (params.sortOrder) queryParams.set('sortOrder', params.sortOrder)

  return useQuery<BlacklistResponse>({
    queryKey: blacklistKeys.list(params),
    queryFn: async () => {
      const res = await axiosClient.get<BlacklistEntry[]>(
        `/api/v1/blacklist?${queryParams.toString()}`
      )
      const entries = res.data as BlacklistEntry[] & { meta?: BlacklistResponse['meta'] }
      return {
        data: entries,
        meta: entries.meta ?? { page: 1, perPage: 20, total: 0, totalPages: 0 },
      }
    },
  })
}

// --- Fetch Single Blacklist Entry ---

export function useBlacklistEntry(id: string) {
  return useQuery<BlacklistEntry>({
    queryKey: [...blacklistKeys.all, id],
    queryFn: async () => {
      const res = await axiosClient.get<BlacklistEntry>(`/api/v1/blacklist/${id}`)
      return res.data
    },
    enabled: !!id,
  })
}

// --- Create Blacklist Entry ---

export function useCreateBlacklistEntry() {
  const queryClient = useQueryClient()

  return useMutation<BlacklistEntry, Error, BlacklistPayload>({
    mutationFn: async (payload) => {
      const res = await axiosClient.post<BlacklistEntry>('/api/v1/blacklist', payload)
      return res.data
    },
    onSuccess: () => {
      toast.success(getT('blacklist.createdSuccess' as never))
      queryClient.invalidateQueries({ queryKey: blacklistKeys.all })
    },
    onError: (error) => {
      toast.error(error.message || getT('blacklist.failedCreate' as never))
    },
  })
}

// --- Update Blacklist Entry ---

export function useUpdateBlacklistEntry(id: string) {
  const queryClient = useQueryClient()

  return useMutation<BlacklistEntry, Error, BlacklistPayload>({
    mutationFn: async (payload) => {
      const res = await axiosClient.patch<BlacklistEntry>(`/api/v1/blacklist/${id}`, payload)
      return res.data
    },
    onSuccess: () => {
      toast.success(getT('blacklist.updatedSuccess' as never))
      queryClient.invalidateQueries({ queryKey: blacklistKeys.all })
    },
    onError: (error) => {
      toast.error(error.message || getT('blacklist.failedUpdate' as never))
    },
  })
}

// --- Delete Blacklist Entry ---

export function useDeleteBlacklistEntry() {
  const queryClient = useQueryClient()

  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      await axiosClient.delete(`/api/v1/blacklist/${id}`)
    },
    onSuccess: () => {
      toast.success(getT('blacklist.deletedSuccess' as never))
      queryClient.invalidateQueries({ queryKey: blacklistKeys.all })
    },
    onError: (error) => {
      toast.error(error.message || getT('blacklist.failedDelete' as never))
    },
  })
}

// --- Check if Value is Blocked ---

export function useCheckBlocked(type: 'license_plate' | 'nrc_passport', value: string) {
  return useQuery<{ blocked: boolean }>({
    queryKey: [...blacklistKeys.all, 'check', type, value],
    queryFn: async () => {
      const res = await axiosClient.get<{ blocked: boolean }>(`/api/v1/blacklist/check?type=${type}&value=${value}`)
      return res.data
    },
    enabled: !!type && !!value,
  })
}

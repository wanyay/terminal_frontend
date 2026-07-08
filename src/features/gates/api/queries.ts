import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import axiosClient from '@/lib/api/axiosClient'

// --- Types ---

export interface Gate {
  id: string
  code: string
  name: string
  type: 'ENTRY' | 'EXIT'
  description: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
  createdBy: string | null
  updatedBy: string | null
}

interface GatesResponse {
  data: Gate[]
  meta: {
    page: number
    perPage: number
    total: number
    totalPages: number
  }
}

interface GatePayload {
  name: string
  type: 'ENTRY' | 'EXIT'
  description?: string
}

// --- Query Keys ---

export const gatesKeys = {
  all: ['gates'] as const,
  list: (params?: Record<string, unknown>) =>
    ['gates', 'list', params] as const,
}

// --- Fetch All Gates (server-side pagination) ---

export function useGates(params: {
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

  return useQuery<GatesResponse>({
    queryKey: gatesKeys.list(params),
    queryFn: async () => {
      const res = await axiosClient.get<Gate[]>(
        `/api/v1/gates?${queryParams.toString()}`
      )
      // After response interceptor unwraps, data is Gate[] with .meta attached
      const gates = res.data as Gate[] & { meta?: GatesResponse['meta'] }
      return {
        data: gates,
        meta: gates.meta ?? { page: 1, perPage: 20, total: 0, totalPages: 0 },
      }
    },
  })
}

// --- Fetch Single Gate ---

export function useGate(id: string) {
  return useQuery<Gate>({
    queryKey: [...gatesKeys.all, id],
    queryFn: async () => {
      const res = await axiosClient.get<Gate>(`/api/v1/gates/${id}`)
      return res.data
    },
    enabled: !!id,
  })
}

// --- Create Gate ---

export function useCreateGate() {
  const queryClient = useQueryClient()

  return useMutation<Gate, Error, GatePayload>({
    mutationFn: async (payload) => {
      const res = await axiosClient.post<Gate>('/api/v1/gates', payload)
      return res.data
    },
    onSuccess: () => {
      toast.success('Gate created successfully')
      queryClient.invalidateQueries({ queryKey: gatesKeys.all })
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create gate')
    },
  })
}

// --- Update Gate ---

export function useUpdateGate(id: string) {
  const queryClient = useQueryClient()

  return useMutation<Gate, Error, GatePayload>({
    mutationFn: async (payload) => {
      const res = await axiosClient.patch<Gate>(`/api/v1/gates/${id}`, payload)
      return res.data
    },
    onSuccess: () => {
      toast.success('Gate updated successfully')
      queryClient.invalidateQueries({ queryKey: gatesKeys.all })
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update gate')
    },
  })
}

// --- Delete Gate ---

export function useDeleteGate() {
  const queryClient = useQueryClient()

  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      await axiosClient.delete(`/api/v1/gates/${id}`)
    },
    onSuccess: () => {
      toast.success('Gate deleted successfully')
      queryClient.invalidateQueries({ queryKey: gatesKeys.all })
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete gate')
    },
  })
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import axiosClient from '@/lib/api/axiosClient'

// --- Types ---

export interface Gate {
  id: string
  code: string
  name: string
  type: 'ENTRY' | 'EXIT'
}

export interface Visitor {
  id: string
  visitorName: string
  nrcOrPassport: string | null
  phoneNumber: string | null
  companyName: string | null
  purposeOfVisit: string | null
  hostEmployee: string | null
  entryGateId: string | null
  exitGateId: string | null
  entryTime: string | null
  exitTime: string | null
  status: 'ENTERED' | 'EXITED' | 'CANCELLED'
  remarks: string | null
  createdAt: string
  updatedAt: string
  entryGate?: Gate | null
  exitGate?: Gate | null
}

interface VisitorsResponse {
  data: Visitor[]
  meta: {
    page: number
    perPage: number
    total: number
    totalPages: number
  }
}

interface CreateVisitorPayload {
  visitorName: string
  nrcOrPassport?: string
  phoneNumber?: string
  companyName?: string
  purposeOfVisit?: string
  hostEmployee?: string
  remarks?: string
}

interface RegisterEntryPayload {
  visitorName: string
  nrcOrPassport?: string
  phoneNumber?: string
  companyName?: string
  purposeOfVisit?: string
  hostEmployee?: string
  entryGateId: string
  remarks?: string
}

interface UpdateVisitorPayload {
  visitorName?: string
  nrcOrPassport?: string
  phoneNumber?: string
  companyName?: string
  purposeOfVisit?: string
  hostEmployee?: string
  remarks?: string
}

// --- Query Keys ---

export const visitorsKeys = {
  all: ['visitors'] as const,
  list: (params?: Record<string, unknown>) =>
    ['visitors', 'list', params] as const,
  active: ['visitors', 'active'] as const,
}

// --- Fetch All Visitors (server-side pagination) ---

export function useVisitors(params: {
  page?: number
  perPage?: number
  search?: string
}) {
  const queryParams = new URLSearchParams()
  if (params.page) queryParams.set('page', String(params.page))
  if (params.perPage) queryParams.set('perPage', String(params.perPage))
  if (params.search) queryParams.set('search', params.search)

  return useQuery<VisitorsResponse>({
    queryKey: visitorsKeys.list(params),
    queryFn: async () => {
      const res = await axiosClient.get<Visitor[]>(
        `/api/v1/visitors?${queryParams.toString()}`
      )
      const visitors = res.data as Visitor[] & {
        meta?: VisitorsResponse['meta']
      }
      return {
        data: visitors,
        meta: visitors.meta ?? {
          page: 1,
          perPage: 20,
          total: 0,
          totalPages: 0,
        },
      }
    },
  })
}

// --- Create Visitor Record only ---

export function useCreateVisitor() {
  const queryClient = useQueryClient()

  return useMutation<Visitor, Error, CreateVisitorPayload>({
    mutationFn: async (payload) => {
      const res = await axiosClient.post<Visitor>('/api/v1/visitors', payload)
      return res.data
    },
    onSuccess: () => {
      toast.success('Visitor record created')
      queryClient.invalidateQueries({ queryKey: visitorsKeys.all })
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create visitor')
    },
  })
}

// --- Register Visitor Entry ---

export function useRegisterEntry() {
  const queryClient = useQueryClient()

  return useMutation<Visitor, Error, RegisterEntryPayload>({
    mutationFn: async (payload) => {
      const res = await axiosClient.post<Visitor>(
        '/api/v1/visitors/entry',
        payload
      )
      return res.data
    },
    onSuccess: (data) => {
      toast.success(`${data.visitorName} has been registered as entered`)
      queryClient.invalidateQueries({ queryKey: visitorsKeys.all })
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to register entry')
    },
  })
}

// --- Register Visitor Exit ---

export function useRegisterExit() {
  const queryClient = useQueryClient()

  return useMutation<Visitor, Error, { id: string; exitGateId: string }>({
    mutationFn: async ({ id, exitGateId }) => {
      const res = await axiosClient.post<Visitor>(
        `/api/v1/visitors/${id}/exit`,
        { exitGateId }
      )
      return res.data
    },
    onSuccess: (data) => {
      toast.success(`${data.visitorName} has been registered as exited`)
      queryClient.invalidateQueries({ queryKey: visitorsKeys.all })
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to register exit')
    },
  })
}

// --- Cancel Visitor ---

export function useCancelVisitor() {
  const queryClient = useQueryClient()

  return useMutation<Visitor, Error, string>({
    mutationFn: async (id) => {
      const res = await axiosClient.post<Visitor>(
        `/api/v1/visitors/${id}/cancel`
      )
      return res.data
    },
    onSuccess: (data) => {
      toast.success(`${data.visitorName} has been cancelled`)
      queryClient.invalidateQueries({ queryKey: visitorsKeys.all })
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to cancel visitor')
    },
  })
}

// --- Update Visitor ---

export function useUpdateVisitor(id: string) {
  const queryClient = useQueryClient()

  return useMutation<Visitor, Error, UpdateVisitorPayload>({
    mutationFn: async (payload) => {
      const res = await axiosClient.patch<Visitor>(
        `/api/v1/visitors/${id}`,
        payload
      )
      return res.data
    },
    onSuccess: () => {
      toast.success('Visitor updated')
      queryClient.invalidateQueries({ queryKey: visitorsKeys.all })
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update visitor')
    },
  })
}

// --- Delete Visitor ---

export function useDeleteVisitor() {
  const queryClient = useQueryClient()

  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      await axiosClient.delete(`/api/v1/visitors/${id}`)
    },
    onSuccess: () => {
      toast.success('Visitor deleted')
      queryClient.invalidateQueries({ queryKey: visitorsKeys.all })
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete visitor')
    },
  })
}

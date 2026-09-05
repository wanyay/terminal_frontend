import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import axiosClient from '@/lib/api/axiosClient'
import { getT } from '@/lib/i18n'

// --- Types ---

export interface ActiveVisitorEntryGate {
  id: string
  code: string
  name: string
  type: 'ENTRY' | 'EXIT'
}

export interface ActiveVisitor {
  id: string
  visitorName: string
  nrcOrPassport: string | null
  phoneNumber: string | null
  companyName: string | null
  purposeOfVisit: string | null
  hostEmployee: string | null
  entryGateId: string
  exitGateId: string | null
  entryTime: string
  exitTime: string | null
  status: string
  remarks: string | null
  entryGate: ActiveVisitorEntryGate | null
  exitGate: null
}

export interface ActiveVisitorsResponse {
  data: ActiveVisitor[]
  meta: {
    page: number
    perPage: number
    total: number
    totalPages: number
  }
}

// --- Query Keys ---

export const activeVisitorsKeys = {
  all: ['active-visitors'] as const,
  list: (params?: Record<string, unknown>) =>
    ['active-visitors', 'list', params] as const,
}

// --- Fetch Active Visitors ---

export function useActiveVisitors(params: {
  page?: number
  perPage?: number
  search?: string
  gateId?: string
}) {
  const queryParams = new URLSearchParams()
  if (params.page) queryParams.set('page', String(params.page))
  if (params.perPage) queryParams.set('perPage', String(params.perPage))
  if (params.search) queryParams.set('search', params.search)
  if (params.gateId) queryParams.set('gateId', params.gateId)

  return useQuery<ActiveVisitorsResponse>({
    queryKey: activeVisitorsKeys.list(params),
    queryFn: async () => {
      const res = await axiosClient.get<ActiveVisitor[]>(
        `/api/v1/visitors/active?${queryParams.toString()}`
      )
      const visitors = res.data as ActiveVisitor[] & {
        meta?: ActiveVisitorsResponse['meta']
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

// --- Fetch Single Visitor ---

export function useVisitor(id: string) {
  return useQuery<ActiveVisitor>({
    queryKey: [...activeVisitorsKeys.all, id],
    queryFn: async () => {
      const res = await axiosClient.get<ActiveVisitor>(`/api/v1/visitors/${id}`)
      return res.data
    },
    enabled: !!id,
  })
}

// --- Register Visitor Exit ---

export interface RegisterVisitorExitPayload {
  exitGateId: string
  remarks?: string
}

export function useRegisterVisitorExit() {
  const queryClient = useQueryClient()

  return useMutation<
    void,
    Error,
    { id: string; payload: RegisterVisitorExitPayload }
  >({
    mutationFn: async ({ id, payload }) => {
      await axiosClient.post(`/api/v1/visitors/${id}/exit`, payload)
    },
    onSuccess: () => {
      toast.success(getT('exit.visitorExitRegistered' as never))
      queryClient.invalidateQueries({ queryKey: activeVisitorsKeys.all })
    },
    onError: (error) => {
      toast.error(error.message || getT('exit.failedRegisterVisitorExit' as never))
    },
  })
}

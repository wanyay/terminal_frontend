import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import axiosClient from '@/lib/api/axiosClient'
import { getT } from '@/lib/i18n'

// --- Types ---

export interface ActiveTruckEntryGate {
  id: string
  code: string
  name: string
  type: 'ENTRY' | 'EXIT'
}

export interface ActiveTruck {
  id: string
  licensePlate: string
  containerNumber: string | null
  driverName: string | null
  driverNrc: string | null
  entryGateId: string
  exitGateId: string | null
  entryTime: string
  exitTime: string | null
  status: string
  remarks: string | null
  entryGate: ActiveTruckEntryGate | null
  exitGate: null
}

export interface ActiveTrucksResponse {
  data: ActiveTruck[]
  meta: {
    page: number
    perPage: number
    total: number
    totalPages: number
  }
}

// --- Query Keys ---

export const activeTrucksKeys = {
  all: ['active-trucks'] as const,
  list: (params?: Record<string, unknown>) =>
    ['active-trucks', 'list', params] as const,
}

// --- Fetch Active Trucks ---

export function useActiveTrucks(params: {
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

  return useQuery<ActiveTrucksResponse>({
    queryKey: activeTrucksKeys.list(params),
    queryFn: async () => {
      const res = await axiosClient.get<ActiveTruck[]>(
        `/api/v1/trucks/active?${queryParams.toString()}`
      )
      const trucks = res.data as ActiveTruck[] & {
        meta?: ActiveTrucksResponse['meta']
      }
      return {
        data: trucks,
        meta: trucks.meta ?? {
          page: 1,
          perPage: 20,
          total: 0,
          totalPages: 0,
        },
      }
    },
  })
}

// --- Fetch Single Truck ---

export function useTruck(id: string) {
  return useQuery<ActiveTruck>({
    queryKey: [...activeTrucksKeys.all, id],
    queryFn: async () => {
      const res = await axiosClient.get<ActiveTruck>(`/api/v1/trucks/${id}`)
      return res.data
    },
    enabled: !!id,
  })
}

// --- Register Truck Exit ---

export interface RegisterTruckExitPayload {
  exitGateId: string
  remarks?: string
}

export function useRegisterTruckExit() {
  const queryClient = useQueryClient()

  return useMutation<
    void,
    Error,
    { id: string; payload: RegisterTruckExitPayload }
  >({
    mutationFn: async ({ id, payload }) => {
      await axiosClient.post(`/api/v1/trucks/${id}/exit`, payload)
    },
    onSuccess: () => {
      toast.success(getT('exit.truckExitRegistered' as never))
      queryClient.invalidateQueries({ queryKey: activeTrucksKeys.all })
    },
    onError: (error) => {
      toast.error(error.message || getT('exit.failedRegisterTruckExit' as never))
    },
  })
}

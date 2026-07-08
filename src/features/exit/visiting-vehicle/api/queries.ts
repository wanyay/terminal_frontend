import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import axiosClient from '@/lib/api/axiosClient'

// --- Types ---

export interface ActiveVehicleEntryGate {
  id: string
  code: string
  name: string
  type: 'ENTRY' | 'EXIT'
}

export interface ActiveVehicle {
  id: string
  plateNumber: string
  vehicleType: string | null
  vehicleModel: string | null
  visitorName: string | null
  nrcOrLicense: string | null
  companyName: string | null
  purposeOfVisit: string | null
  entryGateId: string
  exitGateId: string | null
  entryTime: string
  exitTime: string | null
  status: string
  remarks: string | null
  entryGate: ActiveVehicleEntryGate | null
  exitGate: null
}

export interface ActiveVehiclesResponse {
  data: ActiveVehicle[]
  meta: {
    page: number
    perPage: number
    total: number
    totalPages: number
  }
}

// --- Query Keys ---

export const activeVehiclesKeys = {
  all: ['active-vehicles'] as const,
  list: (params?: Record<string, unknown>) =>
    ['active-vehicles', 'list', params] as const,
}

// --- Fetch Active Vehicles ---

export function useActiveVehicles(params: {
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

  return useQuery<ActiveVehiclesResponse>({
    queryKey: activeVehiclesKeys.list(params),
    queryFn: async () => {
      const res = await axiosClient.get<ActiveVehicle[]>(
        `/api/v1/vehicles/active?${queryParams.toString()}`
      )
      const vehicles = res.data as ActiveVehicle[] & {
        meta?: ActiveVehiclesResponse['meta']
      }
      return {
        data: vehicles,
        meta: vehicles.meta ?? {
          page: 1,
          perPage: 20,
          total: 0,
          totalPages: 0,
        },
      }
    },
  })
}

// --- Fetch Single Vehicle ---

export function useVehicle(id: string) {
  return useQuery<ActiveVehicle>({
    queryKey: [...activeVehiclesKeys.all, id],
    queryFn: async () => {
      const res = await axiosClient.get<ActiveVehicle>(`/api/v1/vehicles/${id}`)
      return res.data
    },
    enabled: !!id,
  })
}

// --- Register Vehicle Exit ---

export interface RegisterVehicleExitPayload {
  exitGateId: string
  remarks?: string
}

export function useRegisterVehicleExit() {
  const queryClient = useQueryClient()

  return useMutation<
    void,
    Error,
    { id: string; payload: RegisterVehicleExitPayload }
  >({
    mutationFn: async ({ id, payload }) => {
      await axiosClient.post(`/api/v1/vehicles/${id}/exit`, payload)
    },
    onSuccess: () => {
      toast.success('Vehicle exit registered successfully')
      queryClient.invalidateQueries({ queryKey: activeVehiclesKeys.all })
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to register vehicle exit')
    },
  })
}

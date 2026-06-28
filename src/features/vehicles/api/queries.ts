import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import axiosClient from '@/lib/api/axiosClient'

// --- Types ---

export interface Vehicle {
  id: string
  plateNumber: string
  vehicleType: string | null
  vehicleModel: string | null
  visitorName: string
  nrcOrLicense: string | null
  companyName: string | null
  purposeOfVisit: string | null
  entryGateId: string | null
  exitGateId: string | null
  entryTime: string | null
  exitTime: string | null
  status: 'ENTERED' | 'EXITED' | 'CANCELLED'
  remarks: string | null
  createdAt: string
  updatedAt: string
}

interface VehiclesResponse {
  data: Vehicle[]
  meta: { page: number; perPage: number; total: number; totalPages: number }
}

interface RegisterEntryPayload {
  plateNumber: string
  visitorName: string
  vehicleType?: string
  vehicleModel?: string
  nrcOrLicense?: string
  companyName?: string
  purposeOfVisit?: string
  entryGateId: string
  remarks?: string
}

interface UpdateVehiclePayload {
  plateNumber?: string
  visitorName?: string
  vehicleType?: string
  vehicleModel?: string
  nrcOrLicense?: string
  companyName?: string
  purposeOfVisit?: string
  remarks?: string
}

// --- Query Keys ---

export const vehiclesKeys = {
  all: ['vehicles'] as const,
  list: (params?: Record<string, unknown>) =>
    ['vehicles', 'list', params] as const,
}

// --- Fetch All (server-side pagination) ---

export function useVehicles(params: {
  page?: number
  perPage?: number
  search?: string
}) {
  const qs = new URLSearchParams()
  if (params.page) qs.set('page', String(params.page))
  if (params.perPage) qs.set('perPage', String(params.perPage))
  if (params.search) qs.set('search', params.search)

  return useQuery<VehiclesResponse>({
    queryKey: vehiclesKeys.list(params),
    queryFn: async () => {
      const res = await axiosClient.get<Vehicle[]>(
        `/api/v1/vehicles?${qs.toString()}`
      )
      const vehicles = res.data as Vehicle[] & {
        meta?: VehiclesResponse['meta']
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

// --- Register Entry ---

export function useRegisterVehicleEntry() {
  const qc = useQueryClient()
  return useMutation<Vehicle, Error, RegisterEntryPayload>({
    mutationFn: async (payload) => {
      const res = await axiosClient.post<Vehicle>(
        '/api/v1/vehicles/entry',
        payload
      )
      return res.data
    },
    onSuccess: (data) => {
      toast.success(`${data.plateNumber} entry registered`)
      qc.invalidateQueries({ queryKey: vehiclesKeys.all })
    },
    onError: (error) =>
      toast.error(error.message || 'Failed to register entry'),
  })
}

// --- Register Exit ---

export function useRegisterVehicleExit() {
  const qc = useQueryClient()
  return useMutation<Vehicle, Error, { id: string; exitGateId: string }>({
    mutationFn: async ({ id, exitGateId }) => {
      const res = await axiosClient.post<Vehicle>(
        `/api/v1/vehicles/${id}/exit`,
        { exitGateId }
      )
      return res.data
    },
    onSuccess: (data) => {
      toast.success(`${data.plateNumber} exit registered`)
      qc.invalidateQueries({ queryKey: vehiclesKeys.all })
    },
    onError: (error) => toast.error(error.message || 'Failed to register exit'),
  })
}

// --- Cancel ---

export function useCancelVehicle() {
  const qc = useQueryClient()
  return useMutation<Vehicle, Error, string>({
    mutationFn: async (id) => {
      const res = await axiosClient.post<Vehicle>(
        `/api/v1/vehicles/${id}/cancel`
      )
      return res.data
    },
    onSuccess: (data) => {
      toast.success(`${data.plateNumber} cancelled`)
      qc.invalidateQueries({ queryKey: vehiclesKeys.all })
    },
    onError: (error) => toast.error(error.message || 'Failed to cancel'),
  })
}

// --- Update ---

export function useUpdateVehicle(id: string) {
  const qc = useQueryClient()
  return useMutation<Vehicle, Error, UpdateVehiclePayload>({
    mutationFn: async (payload) => {
      const res = await axiosClient.patch<Vehicle>(
        `/api/v1/vehicles/${id}`,
        payload
      )
      return res.data
    },
    onSuccess: () => {
      toast.success('Vehicle updated')
      qc.invalidateQueries({ queryKey: vehiclesKeys.all })
    },
    onError: (error) => toast.error(error.message || 'Failed to update'),
  })
}

// --- Delete ---

export function useDeleteVehicle() {
  const qc = useQueryClient()
  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      await axiosClient.delete(`/api/v1/vehicles/${id}`)
    },
    onSuccess: () => {
      toast.success('Vehicle deleted')
      qc.invalidateQueries({ queryKey: vehiclesKeys.all })
    },
    onError: (error) => toast.error(error.message || 'Failed to delete'),
  })
}

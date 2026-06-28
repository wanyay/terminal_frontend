import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import axiosClient from '@/lib/api/axiosClient'

export interface Truck {
  id: string
  licensePlate: string
  containerNumber: string | null
  driverName: string | null
  driverNrc: string | null
  entryGateId: string | null
  exitGateId: string | null
  entryTime: string | null
  exitTime: string | null
  status: 'ENTERED' | 'EXITED' | 'CANCELLED'
  remarks: string | null
  createdAt: string
  updatedAt: string
}

interface TrucksResponse {
  data: Truck[]
  meta: {
    page: number
    perPage: number
    total: number
    totalPages: number
  }
}

interface CreateTruckPayload {
  licensePlate: string
  containerNumber?: string
  driverName?: string
  driverNrc?: string
  entryGateId?: string
  remarks?: string
}

interface RegisterTruckExitPayload {
  id: string
  exitGateId: string
  remarks?: string
}

interface UpdateTruckPayload {
  licensePlate?: string
  containerNumber?: string
  driverName?: string
  driverNrc?: string
  entryGateId?: string
  exitGateId?: string
  remarks?: string
  status?: 'ENTERED' | 'EXITED' | 'CANCELLED'
}

export const trucksKeys = {
  all: ['trucks'] as const,
  list: (params?: Record<string, unknown>) =>
    ['trucks', 'list', params] as const,
}

export function useTrucks(params: {
  page?: number
  perPage?: number
  search?: string
}) {
  const qs = new URLSearchParams()
  if (params.page) qs.set('page', String(params.page))
  if (params.perPage) qs.set('perPage', String(params.perPage))
  if (params.search) qs.set('search', params.search)

  return useQuery<TrucksResponse>({
    queryKey: trucksKeys.list(params),
    queryFn: async () => {
      const res = await axiosClient.get<Truck[]>(
        `/api/v1/trucks?${qs.toString()}`
      )
      const trucks = res.data as Truck[] & { meta?: TrucksResponse['meta'] }
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

export function useCreateTruck() {
  const queryClient = useQueryClient()

  return useMutation<Truck, Error, CreateTruckPayload>({
    mutationFn: async (payload) => {
      const res = await axiosClient.post<Truck>('/api/v1/trucks', payload)
      return res.data
    },
    onSuccess: () => {
      toast.success('Container truck entry registered')
      queryClient.invalidateQueries({ queryKey: trucksKeys.all })
    },
    onError: (error) =>
      toast.error(error.message || 'Failed to register entry'),
  })
}

export function useRegisterTruckExit() {
  const queryClient = useQueryClient()

  return useMutation<Truck, Error, RegisterTruckExitPayload>({
    mutationFn: async ({ id, exitGateId, remarks }) => {
      const res = await axiosClient.post<Truck>(`/api/v1/trucks/${id}/exit`, {
        exitGateId,
        remarks,
      })
      return res.data
    },
    onSuccess: () => {
      toast.success('Container truck exit registered')
      queryClient.invalidateQueries({ queryKey: trucksKeys.all })
    },
    onError: (error) => toast.error(error.message || 'Failed to register exit'),
  })
}

export function useCancelTruck() {
  const queryClient = useQueryClient()

  return useMutation<Truck, Error, string>({
    mutationFn: async (id) => {
      const res = await axiosClient.post<Truck>(`/api/v1/trucks/${id}/cancel`)
      return res.data
    },
    onSuccess: () => {
      toast.success('Container truck cancelled')
      queryClient.invalidateQueries({ queryKey: trucksKeys.all })
    },
    onError: (error) => toast.error(error.message || 'Failed to cancel truck'),
  })
}

export function useUpdateTruck(id: string) {
  const queryClient = useQueryClient()

  return useMutation<Truck, Error, UpdateTruckPayload>({
    mutationFn: async (payload) => {
      const res = await axiosClient.patch<Truck>(
        `/api/v1/trucks/${id}`,
        payload
      )
      return res.data
    },
    onSuccess: () => {
      toast.success('Container truck updated')
      queryClient.invalidateQueries({ queryKey: trucksKeys.all })
    },
    onError: (error) => toast.error(error.message || 'Failed to update truck'),
  })
}

export function useDeleteTruck() {
  const queryClient = useQueryClient()

  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      await axiosClient.delete(`/api/v1/trucks/${id}`)
    },
    onSuccess: () => {
      toast.success('Container truck deleted')
      queryClient.invalidateQueries({ queryKey: trucksKeys.all })
    },
    onError: (error) => toast.error(error.message || 'Failed to delete truck'),
  })
}

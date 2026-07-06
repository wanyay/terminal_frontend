import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import axiosClient from '@/lib/api/axiosClient'

interface ContainerTruckEntryPayload {
  licensePlate: string
  containerNumber?: string
  driverName?: string
  driverNrc?: string
  entryGateId: string
  remarks?: string
}

export function useCreateContainerTruckEntry() {
  return useMutation<unknown, Error, ContainerTruckEntryPayload>({
    mutationFn: async (payload) => {
      const res = await axiosClient.post('/api/v1/trucks/entry', payload)
      return res.data
    },
    onSuccess: () => {
      toast.success('Truck Entry created successfully')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create gate')
    },
  })
}

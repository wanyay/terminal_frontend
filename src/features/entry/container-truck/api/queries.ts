import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import axiosClient from '@/lib/api/axiosClient'
import { getT } from '@/lib/i18n'

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
      toast.success(getT('entry.truckEntryCreated' as never))
    },
    onError: (error) => {
      toast.error(error.message || getT('entry.failedCreateGate' as never))
    },
  })
}

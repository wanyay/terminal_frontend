import { useMutation } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { toast } from 'sonner'
import axiosClient from '@/lib/api/axiosClient'

interface VisitingVehicleEntryPayload {
  plateNumber: string
  visitorName?: string
  vehicleType?: string
  vehicleModel?: string
  nrcOrLicense?: string
  companyName?: string
  purposeOfVisit?: string
  entryGateId?: string
  remarks?: string
}

interface ErrorResponse {
  message: string[]
}

export function useCreateVisitingVehicleEntry() {
  return useMutation<unknown, AxiosError<ErrorResponse>, VisitingVehicleEntryPayload>({
    mutationFn: async (payload) => {
      const res = await axiosClient.post('/api/v1/vehicles/entry', payload)
      return res.data
    },
    onSuccess: () => {
      toast.success('Visiting Vehicle Entry created successfully')
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message?.[0] || error.message || 'Failed to create vehicle entry'
      toast.error(errorMessage)
    },
  })
}

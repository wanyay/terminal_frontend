import { useMutation } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { toast } from 'sonner'
import axiosClient from '@/lib/api/axiosClient'

interface VisitorEntryPayload {
  visitorName: string
  nrcOrPassport?: string
  phoneNumber?: string
  companyName?: string
  purposeOfVisit?: string
  hostEmployee?: string
  entryGateId?: string
  remarks?: string
}

interface ErrorResponse {
  message: string[]
}

export function useCreateVisitorEntry() {
  return useMutation<unknown, AxiosError<ErrorResponse>, VisitorEntryPayload>({
    mutationFn: async (payload) => {
      const res = await axiosClient.post('/api/v1/visitors/entry', payload)
      return res.data
    },
    onSuccess: () => {
      toast.success('Visitor Entry created successfully')
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message?.[0] || error.message || 'Failed to create visitor entry'
      toast.error(errorMessage)
    },
  })
}

import { useMutation } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import { toast } from 'sonner'
import axiosClient from '@/lib/api/axiosClient'
import { getT } from '@/lib/i18n'

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
      toast.success(getT('entry.visitorEntryCreated' as never))
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message?.[0] || error.message || getT('entry.failedCreateVisitor' as never)
      toast.error(errorMessage)
    },
  })
}

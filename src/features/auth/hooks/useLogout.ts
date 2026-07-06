import { useMutation } from '@tanstack/react-query'
import axiosClient from '@/lib/api/axiosClient'
import { useAuthStore } from '../stores/auth-store'

export const useLogout = () => {
  const { auth } = useAuthStore()

  return useMutation({
    mutationFn: async () => {
      await axiosClient.post('/api/v1/auth/logout')
    },
    onSettled: () => {
      // Always clear auth state regardless of success/failure
      auth.reset()
    },
  })
}

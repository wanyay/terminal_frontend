import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import axiosClient from '@/lib/api/axiosClient'
import { useAuthStore } from '../stores/auth-store'

interface ChangePasswordPayload {
  currentPassword: string
  newPassword: string
}

export function useChangePassword() {
  const { auth } = useAuthStore()

  return useMutation<void, Error, ChangePasswordPayload>({
    mutationFn: async (payload) => {
      await axiosClient.post('/api/v1/auth/change-password', payload)
    },
    onSuccess: () => {
      toast.success('Password changed successfully')
      // Update the user profile to reflect password changed
      if (auth.user) {
        auth.setUser({ ...auth.user, mustChangePassword: false })
      }
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to change password')
    },
  })
}

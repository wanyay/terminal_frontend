import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import axiosClient from '@/lib/api/axiosClient'
import { getT } from '@/lib/i18n'
import { useAuthStore } from '../stores/auth-store'

interface ChangePasswordPayload {
  currentPassword?: string
  newPassword: string
  targetUserId?: string
  mustChangePassword: boolean
}

export function useChangePassword() {
  const { auth } = useAuthStore()

  return useMutation<void, Error, ChangePasswordPayload>({
    mutationFn: async (payload) => {
      await axiosClient.post('/api/v1/auth/change-password', payload)
    },
    onSuccess: (_, payload) => {
      // Update the user profile to reflect password changed for self-serve
      if (auth.user && auth.user.mustChangePassword) {
        auth.setUser({ ...auth.user, mustChangePassword: false })
      }
      toast.success(
        payload.targetUserId
          ? getT('auth.passwordResetSuccess' as never)
          : getT('auth.passwordChangedMessage' as never)
      )
    },
    onError: (error) => {
      toast.error(error.message || getT('auth.passwordChangeFailed' as never))
    },
  })
}

import { useMutation } from '@tanstack/react-query'
import axiosClient from '@/lib/api/axiosClient'
import { useAuthStore, type UserProfile } from '../stores/auth-store'

interface LoginPayload {
  username: string
  password: string
}

interface LoginResponse {
  accessToken: string
  refreshToken: string
}

export const useLogin = () => {
  const { auth } = useAuthStore()

  return useMutation<UserProfile, Error, LoginPayload>({
    mutationFn: async (payload: LoginPayload) => {
      // Step 1: Login to get tokens
      const loginRes = await axiosClient.post<LoginResponse>(
        '/api/v1/auth/login',
        payload
      )
      const { accessToken, refreshToken } = loginRes.data

      // Store tokens immediately so profile request is authenticated
      auth.setTokens(accessToken, refreshToken)

      // Step 2: Fetch user profile
      const profileRes = await axiosClient.get<UserProfile>(
        '/api/v1/auth/profile'
      )

      return profileRes.data
    },

    onSuccess: (profile) => {
      // Store the full user profile
      auth.setUser(profile)
    },

    onError: () => {
      // Error is handled by the component's onError callback
      // This prevents the error from propagating to global error handler
    },
  })
}

import axios from 'axios'
import { useAuthStore } from '@/features/auth/stores/auth-store'

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://api.example.com',
  headers: {
    'Content-Type': 'application/json',
  },
})

axiosClient.interceptors.request.use((config) => {
  const accessToken = useAuthStore.getState().auth?.accessToken
  if (accessToken) {
    config.headers['Authorization'] = `Bearer ${accessToken}`
  }
  return config
})

axiosClient.interceptors.response.use(
  (response) => {
    // Unwrap standard API response: { success, message, data, meta } -> data
    if (
      response.data &&
      typeof response.data === 'object' &&
      'data' in response.data
    ) {
      const unwrapped = response.data.data
      // Preserve meta for paginated responses by attaching it to the data
      if ('meta' in response.data) {
        ;(unwrapped as Record<string, unknown>).meta = response.data.meta
      }
      response.data = unwrapped
    }
    return response
  },
  (error) => {
    return Promise.reject(error)
  }
)

export default axiosClient

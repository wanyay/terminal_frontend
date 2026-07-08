import axios from 'axios'
import { useAuthStore } from '@/features/auth/stores/auth-store'

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://api.example.com',
  headers: {
    'Content-Type': 'application/json',
  },
})

let isRefreshing = false
let failedQueue: Array<{
  resolve: (value?: unknown) => void
  reject: (reason?: unknown) => void
}> = []

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

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
  async (error) => {
    const originalRequest = error.config

    // Extract error message from backend response format
    if (error.response?.data?.message) {
      const errorMessage = error.response.data.message
      if (Array.isArray(errorMessage)) {
        error.message = errorMessage.join(', ')
      } else {
        error.message = errorMessage
      }
    }

    // Skip refresh for login/refresh endpoints (expected 401 responses)
    const isAuthEndpoint =
      originalRequest.url?.includes('/auth/login') ||
      originalRequest.url?.includes('/auth/refresh')

    // If error is 401 and we haven't tried refreshing yet
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthEndpoint
    ) {
      if (isRefreshing) {
        // If already refreshing, add to queue
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`
            return axiosClient(originalRequest)
          })
          .catch((err) => {
            return Promise.reject(err)
          })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const refreshToken = useAuthStore.getState().auth?.refreshToken
        if (!refreshToken) {
          throw new Error('No refresh token available')
        }

        const refreshRes = await axios.post(
          `${import.meta.env.VITE_API_URL || 'https://api.example.com'}/api/v1/auth/refresh`,
          { refreshToken }
        )

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
          refreshRes.data.data

        // Update tokens in store
        useAuthStore.getState().auth.setTokens(newAccessToken, newRefreshToken)

        processQueue(null, newAccessToken)

        // Retry original request with new token
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`
        return axiosClient(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError as Error, null)
        // Refresh failed - logout user
        useAuthStore.getState().auth.reset()
        window.location.href = '/sign-in'
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default axiosClient

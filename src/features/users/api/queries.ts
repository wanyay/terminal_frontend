import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import axiosClient from '@/lib/api/axiosClient'

// --- Types ---

export interface UserRole {
  id: string
  name: string
  description: string
}

export interface User {
  id: string
  username: string
  email: string
  firstName: string
  lastName: string
  isActive: boolean
  mustChangePassword: boolean
  roles: UserRole[]
  createdAt: string
  updatedAt: string
}

interface UsersResponse {
  data: User[]
  meta: {
    page: number
    perPage: number
    total: number
    totalPages: number
  }
}

interface CreateUserPayload {
  username: string
  password: string
  firstName: string
  lastName: string
  email: string
  roles?: string[]
}

interface UpdateUserPayload {
  username?: string
  firstName?: string
  lastName?: string
  email?: string
  isActive?: boolean
  roles?: string[]
}

export type RoleValue = (typeof ROLE_OPTIONS)[number]['value']

export const ROLE_OPTIONS = [
  { value: 'SUPER_ADMIN', label: 'Super Admin' },
  { value: 'SECURITY_OFFICER', label: 'Security Officer' },
  { value: 'SUPERVISOR', label: 'Supervisor' },
  { value: 'USER', label: 'User' },
] as const

// --- Query Keys ---

export const usersKeys = {
  all: ['users'] as const,
  list: (params?: Record<string, unknown>) =>
    ['users', 'list', params] as const,
}

// --- Fetch All Users (server-side pagination) ---

export function useUsers(params: {
  page?: number
  perPage?: number
  search?: string
}) {
  const queryParams = new URLSearchParams()
  if (params.page) queryParams.set('page', String(params.page))
  if (params.perPage) queryParams.set('perPage', String(params.perPage))
  if (params.search) queryParams.set('search', params.search)

  return useQuery<UsersResponse>({
    queryKey: usersKeys.list(params),
    queryFn: async () => {
      const res = await axiosClient.get<User[]>(
        `/api/v1/users?${queryParams.toString()}`
      )
      const users = res.data as User[] & { meta?: UsersResponse['meta'] }
      return {
        data: users,
        meta: users.meta ?? { page: 1, perPage: 20, total: 0, totalPages: 0 },
      }
    },
  })
}

// --- Fetch Single User ---

export function useUser(id: string) {
  return useQuery<User>({
    queryKey: [...usersKeys.all, id],
    queryFn: async () => {
      const res = await axiosClient.get<User>(`/api/v1/users/${id}`)
      return res.data
    },
    enabled: !!id,
  })
}

// --- Create User ---

export function useCreateUser() {
  const queryClient = useQueryClient()

  return useMutation<User, Error, CreateUserPayload>({
    mutationFn: async (payload) => {
      const res = await axiosClient.post<User>('/api/v1/users', payload)
      return res.data
    },
    onSuccess: () => {
      toast.success('User created successfully')
      queryClient.invalidateQueries({ queryKey: usersKeys.all })
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create user')
    },
  })
}

// --- Update User ---

export function useUpdateUser(id: string) {
  const queryClient = useQueryClient()

  return useMutation<User, Error, UpdateUserPayload>({
    mutationFn: async (payload) => {
      const res = await axiosClient.patch<User>(`/api/v1/users/${id}`, payload)
      return res.data
    },
    onSuccess: () => {
      toast.success('User updated successfully')
      queryClient.invalidateQueries({ queryKey: usersKeys.all })
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update user')
    },
  })
}

// --- Delete User ---

export function useDeleteUser() {
  const queryClient = useQueryClient()

  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      await axiosClient.delete(`/api/v1/users/${id}`)
    },
    onSuccess: () => {
      toast.success('User deleted successfully')
      queryClient.invalidateQueries({ queryKey: usersKeys.all })
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete user')
    },
  })
}

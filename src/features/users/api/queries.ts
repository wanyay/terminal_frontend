import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import axiosClient from '@/lib/api/axiosClient'
import { getT, type TranslationKey } from '@/lib/i18n'

// --- Types ---

export interface UserRole {
  id: string
  name: string
  description: string
}

export interface UserGate {
  id: string
  code: string
  name: string
  type: 'ENTRY' | 'EXIT'
}

export interface User {
  id: string
  username: string
  email: string
  fullName: string
  isActive: boolean
  mustChangePassword: boolean
  roles: UserRole[]
  assignedGate: UserGate | null
  manageableGates: UserGate[]
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

export interface CreateUserPayload {
  username: string
  password: string
  fullName: string
  email?: string
  roles?: string[]
  assignedGateId?: string
  manageableGateIds?: string[]
}

export interface UpdateUserPayload {
  username?: string
  fullName?: string
  email?: string
  isActive?: boolean
  roles?: string[]
  assignedGateId?: string | null
  manageableGateIds?: string[]
}

export type RoleValue = (typeof ROLE_OPTIONS)[number]['value']

export const ROLE_OPTIONS = [
  { value: 'SUPER_ADMIN', label: 'Super Admin' },
  { value: 'SECURITY_OFFICER', label: 'Security Officer' },
  { value: 'SUPERVISOR', label: 'Supervisor' },
  { value: 'USER', label: 'User' },
] as const

export function getRoleOptions(t: (key: TranslationKey, params?: Record<string, string | number>) => string) {
  return [
    { value: 'SUPER_ADMIN', label: t('users.superAdmin' as never) },
    { value: 'SECURITY_OFFICER', label: t('users.securityOfficer' as never) },
    { value: 'SUPERVISOR', label: t('users.supervisor' as never) }
  ] as const
}

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
      toast.success(getT('users.createdSuccess' as never))
      queryClient.invalidateQueries({ queryKey: usersKeys.all })
    },
    onError: (error) => {
      toast.error(error.message || getT('users.failedCreate' as never))
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
      toast.success(getT('users.updatedSuccess' as never))
      queryClient.invalidateQueries({ queryKey: usersKeys.all })
    },
    onError: (error) => {
      toast.error(error.message || getT('users.failedUpdate' as never))
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
      toast.success(getT('users.deletedSuccess' as never))
      queryClient.invalidateQueries({ queryKey: usersKeys.all })
    },
    onError: (error) => {
      toast.error(error.message || getT('users.failedDelete' as never))
    },
  })
}

// --- Activate User ---

export function useActivateUser() {
  const queryClient = useQueryClient()

  return useMutation<User, Error, string>({
    mutationFn: async (id) => {
      const res = await axiosClient.post<User>(`/api/v1/users/${id}/activate`)
      return res.data
    },
    onSuccess: () => {
      toast.success(getT('users.activatedSuccess' as never))
      queryClient.invalidateQueries({ queryKey: usersKeys.all })
    },
    onError: (error) => {
      toast.error(error.message || getT('users.failedActivate' as never))
    },
  })
}

// --- Deactivate User ---

export function useDeactivateUser() {
  const queryClient = useQueryClient()

  return useMutation<User, Error, string>({
    mutationFn: async (id) => {
      const res = await axiosClient.post<User>(`/api/v1/users/${id}/deactivate`)
      return res.data
    },
    onSuccess: () => {
      toast.success(getT('users.deactivatedSuccess' as never))
      queryClient.invalidateQueries({ queryKey: usersKeys.all })
    },
    onError: (error) => {
      toast.error(error.message || getT('users.failedDeactivate' as never))
    },
  })
}

import { create } from 'zustand'
import { getCookie, setCookie, removeCookie } from '@/lib/cookies'

const ACCESS_TOKEN_KEY = 'access_token'
const REFRESH_TOKEN_KEY = 'refresh_token'
const USER_KEY = 'user'

export interface UserPermission {
  id: string
  name: string
  description: string
}

export interface UserRole {
  id: string
  name: string
  description: string
  permissions: UserPermission[]
}

export interface UserGate {
  id: string
  code: string
  name: string
  type: 'ENTRY' | 'EXIT'
}

export interface UserProfile {
  id: string
  username: string
  email: string
  fullName: string
  isActive: boolean
  mustChangePassword: boolean
  roles: UserRole[]
  assignedGate: UserGate | null
  manageableGates: UserGate[]
}

interface AuthState {
  auth: {
    user: UserProfile | null
    accessToken: string
    refreshToken: string
    roleNames: string[]
    permissionNames: string[]
    assignedGates: UserGate[]
    setUser: (user: UserProfile | null) => void
    setAccessToken: (token: string) => void
    setRefreshToken: (token: string) => void
    setTokens: (accessToken: string, refreshToken: string) => void
    reset: () => void
  }
}

function readCookie<T>(key: string, fallback: T): T {
  const val = getCookie(key)
  if (!val) return fallback
  try {
    return JSON.parse(val) as T
  } catch {
    return fallback
  }
}

function getRoleNames(user: UserProfile | null): string[] {
  return user?.roles?.map((r) => r.name) ?? []
}

function getPermissionNames(user: UserProfile | null): string[] {
  return user?.roles?.flatMap((r) => r.permissions.map((p) => p.name)) ?? []
}

function getAssignedGates(user: UserProfile | null): UserGate[] {
  // Combine assignedGate (single) and manageableGates (array) into one array
  const gates: UserGate[] = []
  if (user?.assignedGate) {
    gates.push(user.assignedGate)
  }
  if (user?.manageableGates) {
    gates.push(...user.manageableGates)
  }
  return gates
}

export const useAuthStore = create<AuthState>()((set) => ({
  auth: {
    user: readCookie<UserProfile | null>(USER_KEY, null),
    accessToken: readCookie<string>(ACCESS_TOKEN_KEY, ''),
    refreshToken: readCookie<string>(REFRESH_TOKEN_KEY, ''),
    roleNames: getRoleNames(readCookie<UserProfile | null>(USER_KEY, null)),
    permissionNames: getPermissionNames(
      readCookie<UserProfile | null>(USER_KEY, null)
    ),
    assignedGates: getAssignedGates(
      readCookie<UserProfile | null>(USER_KEY, null)
    ),

    setUser: (user) =>
      set((state) => {
        if (user) {
          // Store a slimmed-down version in cookies (full profile can exceed 4KB limit)
          const slimUser = {
            id: user.id,
            username: user.username,
            email: user.email,
            fullName: user.fullName,
            isActive: user.isActive,
            mustChangePassword: user.mustChangePassword,
            roles: user.roles.map((r) => ({
              id: r.id,
              name: r.name,
              description: r.description,
              permissions: r.permissions.map((p) => ({
                id: p.id,
                name: p.name,
                description: p.description,
              })),
            })),
            assignedGate: user.assignedGate
              ? {
                  id: user.assignedGate.id,
                  code: user.assignedGate.code,
                  name: user.assignedGate.name,
                  type: user.assignedGate.type,
                }
              : null,
            manageableGates: (user.manageableGates ?? []).map((g) => ({
              id: g.id,
              code: g.code,
              name: g.name,
              type: g.type,
            })),
          }
          setCookie(USER_KEY, JSON.stringify(slimUser))
        } else {
          removeCookie(USER_KEY)
        }
        return {
          ...state,
          auth: {
            ...state.auth,
            user,
            roleNames: getRoleNames(user),
            permissionNames: getPermissionNames(user),
            assignedGates: getAssignedGates(user),
          },
        }
      }),

    setAccessToken: (accessToken) =>
      set((state) => {
        setCookie(ACCESS_TOKEN_KEY, JSON.stringify(accessToken))
        return { ...state, auth: { ...state.auth, accessToken } }
      }),

    setRefreshToken: (refreshToken) =>
      set((state) => {
        setCookie(REFRESH_TOKEN_KEY, JSON.stringify(refreshToken))
        return { ...state, auth: { ...state.auth, refreshToken } }
      }),

    setTokens: (accessToken, refreshToken) =>
      set((state) => {
        setCookie(ACCESS_TOKEN_KEY, JSON.stringify(accessToken))
        setCookie(REFRESH_TOKEN_KEY, JSON.stringify(refreshToken))
        return { ...state, auth: { ...state.auth, accessToken, refreshToken } }
      }),

    reset: () =>
      set((state) => {
        removeCookie(USER_KEY)
        removeCookie(ACCESS_TOKEN_KEY)
        removeCookie(REFRESH_TOKEN_KEY)
        return {
          ...state,
          auth: {
            ...state.auth,
            user: null,
            accessToken: '',
            refreshToken: '',
            roleNames: [],
            permissionNames: [],
            assignedGates: [],
          },
        }
      }),
  },
}))

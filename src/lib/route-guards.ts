import { redirect } from '@tanstack/react-router'
import { useAuthStore } from '@/features/auth/stores/auth-store'

/**
 * Route guard that redirects to the dashboard if the user doesn't have
 * at least one of the given roles.
 */
export function requireRoles(...allowedRoles: string[]) {
  return () => {
    const { auth } = useAuthStore.getState()
    const hasRole = auth.roleNames.some((r) => allowedRoles.includes(r))
    if (!hasRole) {
      throw redirect({ to: '/', replace: true })
    }
  }
}

/**
 * Route guard that checks if the user has at least one gate of the
 * given type(s). SUPER_ADMIN bypasses this check.
 */
export function requireGateType(...gateTypes: Array<'ENTRY' | 'EXIT'>) {
  return () => {
    const { auth } = useAuthStore.getState()
    // SUPER_ADMIN can access everything regardless of gate assignment
    if (auth.roleNames.includes('SUPER_ADMIN')) return
    const hasGate = auth.assignedGates.some((g) => gateTypes.includes(g.type))
    if (!hasGate) {
      throw redirect({ to: '/', replace: true })
    }
  }
}

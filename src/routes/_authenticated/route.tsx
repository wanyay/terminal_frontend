import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout'
import { useAuthStore } from '@/features/auth/stores/auth-store'
import { useEffect } from 'react'

export const Route = createFileRoute('/_authenticated')({
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate()
  const { auth } = useAuthStore()

  useEffect(() => {
    if (!auth.user || !auth.accessToken) {
      navigate({
        to: '/sign-in',
      })
      return
    }
    if (auth.user.mustChangePassword) {
      navigate({
        to: '/change-password',
      })
      return
    }
  }, [auth, navigate])

  if (!auth.user || !auth.accessToken) {
    return null
  }

  if (auth.user.mustChangePassword) {
    return null
  }

  return <AuthenticatedLayout />
}
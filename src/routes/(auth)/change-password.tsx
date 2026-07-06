import { z } from 'zod'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { ChangePassword } from '@/features/auth/pages/change-password'
import { useAuthStore } from '@/features/auth/stores/auth-store'

const searchSchema = z.object({
  redirect: z.string().optional(),
})

export const Route = createFileRoute('/(auth)/change-password')({
  component: ChangePassword,
  validateSearch: searchSchema,
  beforeLoad: () => {
    const { auth } = useAuthStore.getState()
    // If user is not logged in, redirect to sign-in
    if (!auth.user || !auth.accessToken) {
      throw redirect({
        to: '/sign-in',
        replace: true,
      })
    }
    // If user doesn't need to change password, redirect to dashboard
    if (!auth.user.mustChangePassword) {
      throw redirect({
        to: '/',
        replace: true,
      })
    }
  },
})

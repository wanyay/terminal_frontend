import { z } from 'zod'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { SignIn } from '@/features/auth/Signin'
import { useAuthStore } from '@/features/auth/stores/auth-store'

const searchSchema = z.object({
  redirect: z.string().optional(),
})

export const Route = createFileRoute('/(auth)/sign-in')({
  component: SignIn, 
  validateSearch: searchSchema,
  beforeLoad: () => {
    const { auth } = useAuthStore.getState()
    if (auth.user && auth.accessToken) {
      throw redirect({
        to: '/',
        replace: true,
      })
    }
  },
})
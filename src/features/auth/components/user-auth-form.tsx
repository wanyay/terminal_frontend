import { z } from 'zod'
import { AxiosError } from 'axios'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
import { Loader2, LogIn } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/password-input'
import { useLogin } from '../hooks/useLogin'

const formSchema = z.object({
  username: z.string().min(3, 'Please enter your username'),

  password: z
    .string()
    .min(1, 'Please enter your password')
    .min(8, 'Password must be at least 8 characters long'),
})

interface UserAuthFormProps extends React.HTMLAttributes<HTMLFormElement> {
  redirectTo?: string
}

export function UserAuthForm({
  className,
  redirectTo,
  ...props
}: UserAuthFormProps) {
  const navigate = useNavigate()
  const { mutate: login, isPending } = useLogin()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  })

  async function onSubmit(data: z.infer<typeof formSchema>) {
    login(data, {
      onSuccess: (_profile) => {
        // Show success message
        toast.success(`Welcome back, ${data.username}!`)

        // Wait for next tick to ensure auth state is updated before navigation
        setTimeout(() => {
          // Redirect to the stored location or default to dashboard
          const targetPath = redirectTo || '/'
          navigate({ to: targetPath, replace: true })
        }, 100)
      },

      onError: (error) => {
        if (error instanceof AxiosError) {
          const errorMessage = error?.response?.data?.message || 'Login failed. Please check your credentials.'
          
          // Only show toast for 500 errors
          if (error.response?.status === 500) {
            toast.error(errorMessage)
          }
          
          // Always show form error
          form.setError(
            'password',
            {
              type: 'server',
              message: errorMessage,
            },
            { shouldFocus: true }
          )
        }
      },
    })
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('grid gap-3', className)}
        {...props}
      >
        <FormField
          control={form.control}
          name='username'
          render={({ field }) => (
            <FormItem>
              <FormLabel>User Name</FormLabel>
              <FormControl>
                <Input placeholder='john-doe' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='password'
          render={({ field }) => (
            <FormItem className='relative'>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <PasswordInput placeholder='********' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type='submit' className='mt-2' disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              Signing in...
            </>
          ) : (
            <>
              <LogIn className='mr-2 h-4 w-4' />
              Sign in
            </>
          )}
        </Button>
      </form>
    </Form>
  )
}

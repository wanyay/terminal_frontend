import { z } from 'zod'
import { AxiosError } from 'axios'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
import { Loader2, KeyRound } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { PasswordInput } from '@/components/password-input'
import { useChangePassword } from '../hooks/useChangePassword'
import { AuthLayout } from '../layout/auth-layout'

const formSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(100, 'Password must be at most 100 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type FormValues = z.infer<typeof formSchema>

interface ChangePasswordProps extends React.HTMLAttributes<HTMLFormElement> {
  redirectTo?: string
}

export function ChangePassword({
  className,
  redirectTo,
  ...props
}: ChangePasswordProps) {
  const navigate = useNavigate()
  const { mutate: changePassword, isPending } = useChangePassword()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  function onSubmit(data: FormValues) {
    changePassword(
      {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        mustChangePassword: false,
      },
      {
        onSuccess: () => {
          toast.success('Password changed successfully!')
          const targetPath = redirectTo || '/'
          navigate({ to: targetPath, replace: true })
        },
        onError: (error) => {
          if (error instanceof AxiosError) {
            const msg = error?.response?.data?.message
            const firstErr = Array.isArray(msg) ? msg[0] : msg
            if (firstErr) {
              form.setError('currentPassword', {
                type: 'server',
                message: firstErr,
              })
            }
          }
        },
      }
    )
  }

  return (
    <AuthLayout>
      <Card className='gap-4'>
        <CardHeader>
          <CardTitle className='text-lg tracking-tight'>
            <div className='flex items-center gap-2'>
              <KeyRound className='h-5 w-5 text-amber-500' />
              Change Password
            </div>
          </CardTitle>
          <p className='text-muted-foreground text-sm'>
            You must change your password before continuing.
          </p>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className={cn('grid gap-3', className)}
              {...props}
            >
              <FormField
                control={form.control}
                name='currentPassword'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Password</FormLabel>
                    <FormControl>
                      <PasswordInput placeholder='••••••••' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='newPassword'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <PasswordInput placeholder='••••••••' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='confirmPassword'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm New Password</FormLabel>
                    <FormControl>
                      <PasswordInput placeholder='••••••••' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type='submit' className='mt-2' disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Changing Password...
                  </>
                ) : (
                  'Change Password'
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </AuthLayout>
  )
}

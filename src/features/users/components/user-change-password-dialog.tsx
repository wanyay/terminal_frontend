import { z } from 'zod'
import { AxiosError } from 'axios'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { KeyRound } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { PasswordInput } from '@/components/password-input'
import { useChangePassword } from '@/features/auth/hooks/useChangePassword'
import type { User } from '../api/queries'

const formSchema = z
  .object({
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

interface UserChangePasswordDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: User
}

export function UserChangePasswordDialog({
  open,
  onOpenChange,
  user,
}: UserChangePasswordDialogProps) {
  const { mutate: changePassword, isPending } = useChangePassword()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
  })

  function onSubmit(data: FormValues) {
    changePassword(
      {
        newPassword: data.newPassword,
        targetUserId: user.id,
        mustChangePassword: true,
      },
      {
        onSuccess: () => {
          form.reset()
          onOpenChange(false)
        },
        onError: (error) => {
          if (error instanceof AxiosError) {
            const msg = error?.response?.data?.message
            const firstErr = Array.isArray(msg) ? msg[0] : msg
            if (firstErr) {
              form.setError('newPassword', {
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-106.25'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <KeyRound className='h-5 w-5 text-amber-500' />
            Reset Password
          </DialogTitle>
          <DialogDescription>
            Reset password for <span className='font-medium'>{user.username}</span>. The user will be required to change their password on next login.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
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
            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type='submit' disabled={isPending}>
                {isPending ? 'Resetting...' : 'Reset Password'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

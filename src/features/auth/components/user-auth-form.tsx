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
import { useTranslation } from '@/context/language-provider'
import { getT } from '@/lib/i18n'
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
  const { t } = useTranslation()

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
        toast.success(getT('auth.welcomeBack' as never, { name: data.username }))

        setTimeout(() => {
          const targetPath = redirectTo || '/'
          navigate({ to: targetPath, replace: true })
        }, 100)
      },

      onError: (error) => {
        if (error instanceof AxiosError) {
          const errorMessage = error?.response?.data?.message || getT('auth.loginFailed' as never)
          
          if (error.response?.status === 500) {
            toast.error(errorMessage)
          }
          
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
              <FormLabel>{t('auth.username' as never)}</FormLabel>
              <FormControl>
                <Input placeholder={t('auth.usernamePlaceholder' as never)} {...field} />
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
              <FormLabel>{t('auth.password' as never)}</FormLabel>
              <FormControl>
                <PasswordInput placeholder={t('auth.passwordPlaceholder' as never)} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type='submit' className='mt-2' disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              {t('auth.signingIn' as never)}
            </>
          ) : (
            <>
              <LogIn className='mr-2 h-4 w-4' />
              {t('auth.signIn' as never)}
            </>
          )}
        </Button>
      </form>
    </Form>
  )
}

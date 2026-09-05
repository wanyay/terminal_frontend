import { useEffect } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { RotateCcw, Search } from 'lucide-react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DatePicker } from '@/components/date-picker'
import { useTranslation } from '@/context/language-provider'

const filterSchema = z.object({
  search: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  action: z.string().optional(),
  module: z.string().optional(),
})

export type AuditLogFiltersFormValues = z.infer<typeof filterSchema>

const ACTION_OPTIONS = [
  { value: 'LOGIN', label: 'login' },
  { value: 'LOGOUT', label: 'logout' },
  { value: 'CREATE', label: 'create' },
  { value: 'UPDATE', label: 'update' },
  { value: 'DELETE', label: 'delete' },
  { value: 'APPROVE', label: 'approve' },
  { value: 'EXPORT', label: 'export' },
  { value: 'REGISTER_ENTRY', label: 'registerEntry' },
  { value: 'REGISTER_EXIT', label: 'registerExit' },
] as const

const MODULE_OPTIONS = [
  { value: 'AUTH', label: 'auth' },
  { value: 'USERS', label: 'users' },
  { value: 'GATES', label: 'gates' },
  { value: 'TRUCKS', label: 'trucks' },
  { value: 'VEHICLES', label: 'vehicles' },
  { value: 'VISITORS', label: 'visitors' },
  { value: 'BLACKLIST', label: 'blacklist' },
  { value: 'REPORTS', label: 'reports' },
  { value: 'SETTINGS', label: 'settings' },
] as const

interface AuditLogFiltersProps {
  values: {
    search: string
    startDate?: string
    endDate?: string
    action?: string
    module?: string
  }
  onSubmit: (values: AuditLogFiltersFormValues) => void
  onReset: () => void
}

export function AuditLogFilters({
  values,
  onSubmit,
  onReset,
}: AuditLogFiltersProps) {
  const { t } = useTranslation()

  const form = useForm<AuditLogFiltersFormValues>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      search: values.search ?? '',
      startDate: values.startDate ? new Date(values.startDate) : undefined,
      endDate: values.endDate ? new Date(values.endDate) : undefined,
      action: values.action ?? undefined,
      module: values.module ?? undefined,
    },
  })

  useEffect(() => {
    form.reset({
      search: values.search ?? '',
      startDate: values.startDate ? new Date(values.startDate) : undefined,
      endDate: values.endDate ? new Date(values.endDate) : undefined,
      action: values.action ?? undefined,
      module: values.module ?? undefined,
    })
  }, [form, values])

  const handleSubmit = (data: AuditLogFiltersFormValues) => {
    onSubmit(data)
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className='bg-card space-y-4 rounded-lg border p-4'
      >
        <div className='grid w-full grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5'>
          <FormField
            control={form.control}
            name='search'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('auditLogs.search' as never)}</FormLabel>
                <FormControl>
                  <div className='relative'>
                    <Search className='text-muted-foreground absolute top-3.5 left-3 h-5 w-5' />
                    <Input
                      placeholder={t('auditLogs.searchPlaceholder' as never)}
                      className='h-11 pl-10 text-base'
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='startDate'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('auditLogs.startDate' as never)}</FormLabel>
                <FormControl>
                  <DatePicker
                    selected={field.value}
                    onSelect={field.onChange}
                    placeholder={t('auditLogs.startDatePlaceholder' as never)}
                    className='h-11 text-base'
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='endDate'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('auditLogs.endDate' as never)}</FormLabel>
                <FormControl>
                  <DatePicker
                    selected={field.value}
                    onSelect={field.onChange}
                    placeholder={t('auditLogs.endDatePlaceholder' as never)}
                    className='h-11 text-base'
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='action'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('auditLogs.action' as never)}</FormLabel>
                <Select
                  onValueChange={(value) =>
                    field.onChange(value === '__all__' ? undefined : value)
                  }
                  value={field.value || '__all__'}
                >
                  <FormControl>
                    <SelectTrigger className='h-11 w-full text-base'>
                      <SelectValue placeholder={t('auditLogs.allActions' as never)} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value='__all__'>{t('auditLogs.allActions' as never)}</SelectItem>
                    {ACTION_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {t(`auditLogs.${option.label}` as never)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='module'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('auditLogs.module' as never)}</FormLabel>
                <Select
                  onValueChange={(value) =>
                    field.onChange(value === '__all__' ? undefined : value)
                  }
                  value={field.value || '__all__'}
                >
                  <FormControl>
                    <SelectTrigger className='h-11 w-full text-base'>
                      <SelectValue placeholder={t('auditLogs.allModules' as never)} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value='__all__'>{t('auditLogs.allModules' as never)}</SelectItem>
                    {MODULE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {t(`auditLogs.${option.label}` as never)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className='flex flex-wrap items-center justify-start gap-2'>
          <Button type='submit'>{t('common.apply' as never)}</Button>
          <Button
            type='button'
            variant='outline'
            onClick={() => {
              form.reset({
                search: '',
                startDate: undefined,
                endDate: undefined,
                action: undefined,
                module: undefined,
              })
              onReset()
            }}
          >
            <RotateCcw className='mr-2 h-4 w-4' />
            {t('common.reset' as never)}
          </Button>
        </div>
      </form>
    </Form>
  )
}

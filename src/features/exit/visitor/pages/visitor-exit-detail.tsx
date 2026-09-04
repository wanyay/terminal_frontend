import { useState } from 'react'
import { z } from 'zod'
import { format } from 'date-fns'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, useParams } from '@tanstack/react-router'
import { ArrowLeft, Loader2, LogOut } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/status-badge'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { useAuthStore } from '@/features/auth/stores/auth-store'
import { useTranslation } from '@/context/language-provider'
import { getT } from '@/lib/i18n'
import { useVisitor, useRegisterVisitorExit } from '../api/queries'

const formSchema = z.object({
  exitGateId: z.string().min(1, getT('exit.exitGateRequired' as never)),
  remarks: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

export function VisitorExitDetail() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { visitorId } = useParams({
    from: '/_authenticated/exit-registration/visitor/$visitorId',
  })
  const { auth } = useAuthStore()
  const exitGates = auth.assignedGates.filter((g) => g.type === 'EXIT')
  const [gateStatus, setGateStatus] = useState<'closed' | 'open'>('closed')

  const { data: visitor, isLoading, isError } = useVisitor(visitorId)
  const { mutate: registerExit, isPending } = useRegisterVisitorExit()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      exitGateId: exitGates.length > 0 ? exitGates[0].id : '',
      remarks: '',
    },
  })

  function onSubmit(data: FormValues) {
    registerExit(
      {
        id: visitorId,
        payload: {
          exitGateId: data.exitGateId,
          remarks: data.remarks || undefined,
        },
      },
      {
        onSuccess: () => {
          navigate({ to: '/exit-registration/visitor', replace: true })
        },
      }
    )
  }

  if (isError) {
    return (
      <div className='flex items-center justify-center py-12'>
        <p className='text-destructive text-sm'>
          {t('exit.failedLoadVisitor' as never)}
        </p>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      <Button
        variant='ghost'
        className='-ml-2'
        onClick={() => navigate({ to: '/exit-registration/visitor' })}
      >
        <ArrowLeft className='mr-1 h-4 w-4' />
        {t('exit.backToActiveVisitors' as never)}
      </Button>

      <div className='grid gap-6 lg:grid-cols-2'>
        {/* Visitor Details Card */}
        <Card>
          <CardHeader>
            <CardTitle className='text-lg'>{t('exit.visitorDetails' as never)}</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className='space-y-3'>
                {Array.from({ length: 11 }).map((_, i) => (
                  <Skeleton key={i} className='h-5 w-full' />
                ))}
              </div>
            ) : visitor ? (
              <div className='space-y-6'>
                <dl className='space-y-3'>
                  <div className='flex justify-between'>
                    <dt className='text-muted-foreground text-sm'>
                      {t('exit.visitorName' as never)}
                    </dt>
                    <dd className='text-sm font-medium'>
                      {visitor.visitorName}
                    </dd>
                  </div>
                  <div className='flex justify-between'>
                    <dt className='text-muted-foreground text-sm'>
                      {t('exit.nrcOrPassport' as never)}
                    </dt>
                    <dd className='text-sm'>{visitor.nrcOrPassport || '—'}</dd>
                  </div>
                  <div className='flex justify-between'>
                    <dt className='text-muted-foreground text-sm'>{t('exit.phone' as never)}</dt>
                    <dd className='text-sm'>{visitor.phoneNumber || '—'}</dd>
                  </div>
                  <div className='flex justify-between'>
                    <dt className='text-muted-foreground text-sm'>{t('exit.company' as never)}</dt>
                    <dd className='text-sm'>{visitor.companyName || '—'}</dd>
                  </div>
                  <div className='flex justify-between'>
                    <dt className='text-muted-foreground text-sm'>
                      {t('exit.purposeOfVisit' as never)}
                    </dt>
                    <dd className='text-sm'>{visitor.purposeOfVisit || '—'}</dd>
                  </div>
                  <div className='flex justify-between'>
                    <dt className='text-muted-foreground text-sm'>
                      {t('exit.hostEmployee' as never)}
                    </dt>
                    <dd className='text-sm'>{visitor.hostEmployee || '—'}</dd>
                  </div>
                  <div className='flex justify-between'>
                    <dt className='text-muted-foreground text-sm'>
                      {t('exit.entryGate' as never)}
                    </dt>
                    <dd className='text-sm'>
                      {visitor.entryGate ? (
                        <Badge variant='outline' className='text-xs'>
                          {visitor.entryGate.name}
                        </Badge>
                      ) : (
                        '—'
                      )}
                    </dd>
                  </div>
                  <div className='flex justify-between'>
                    <dt className='text-muted-foreground text-sm'>
                      {t('exit.entryTime' as never)}
                    </dt>
                    <dd className='text-sm'>
                      {format(new Date(visitor.entryTime), 'dd/MM/yyyy HH:mm')}
                    </dd>
                  </div>
                  <div className='flex justify-between'>
                    <dt className='text-muted-foreground text-sm'>{t('exit.status' as never)}</dt>
                    <dd>
                      <StatusBadge
                        status={visitor.status}
                        label={t(`statusBadges.${visitor.status.toLowerCase()}` as never)}
                        className='text-xs'
                      />
                    </dd>
                  </div>
                </dl>

                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className='space-y-4'
                  >
                    <FormField
                      control={form.control}
                      name='exitGateId'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('exit.exitGate' as never)}</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={t('exit.selectExitGate' as never)} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {exitGates.map((gate) => (
                                <SelectItem key={gate.id} value={gate.id}>
                                  {gate.name}
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
                      name='remarks'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('exit.remarks' as never)}</FormLabel>
                          <FormControl>
                            <Textarea
                              rows={3}
                              placeholder={t('exit.anyRemarks' as never)}
                              className='resize-none'
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type='submit'
                      className='w-full'
                      disabled={isPending}
                    >
                      {isPending ? (
                        <>
                          <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                          {t('exit.registeringExit' as never)}
                        </>
                      ) : (
                        <>
                          <LogOut className='mr-2 h-4 w-4' />
                          {t('exit.registerExit' as never)}
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </div>
            ) : null}
          </CardContent>
        </Card>

        {/* Barrier Gate Animation Card */}
        {/* 2 & 3. Controls and Visualization Grouped Together */}
        {/* Changed to `items-end` so the bottoms of the buttons and animation align perfectly */}
        <div className='flex w-full flex-1 flex-col items-center justify-center gap-12 pb-10 sm:flex-row'>
          {/* Gate Control Buttons */}
          <div className='flex shrink-0 flex-col gap-5'>
            <button
              type='button'
              onClick={() => setGateStatus('open')}
              className='flex h-14 w-40 items-center justify-center rounded-lg bg-green-600 text-sm font-bold tracking-wide text-white shadow-md transition-all hover:bg-green-500 hover:shadow-lg active:scale-95'
            >
              {t('common.openGate' as never)}
            </button>
            <button
              type='button'
              onClick={() => setGateStatus('closed')}
              className='flex h-14 w-40 items-center justify-center rounded-lg bg-red-700 text-sm font-bold tracking-wide text-white shadow-md transition-all hover:bg-red-600 hover:shadow-lg active:scale-95'
            >
              {t('common.closeGate' as never)}
            </button>
          </div>

          {/* Gate Visualization (No Background) */}
          {/* Removed translate-y shift to keep it completely level with the bottom button */}
          <div className='relative flex items-end justify-center'>
            {/* Traffic Light */}
            <div className='z-10 flex h-32 w-16 flex-col items-center justify-center gap-4 rounded-full border-2 border-slate-700 bg-slate-800 shadow-xl'>
              <div
                className={`h-10 w-10 rounded-full shadow-inner transition-all duration-300 ${
                  gateStatus === 'open'
                    ? 'bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.7)]'
                    : 'bg-slate-700'
                }`}
              ></div>
              <div
                className={`h-10 w-10 rounded-full shadow-inner transition-all duration-300 ${
                  gateStatus === 'closed'
                    ? 'animate-pulse bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.7)]'
                    : 'bg-slate-700'
                }`}
              ></div>
            </div>

            {/* Boom Barrier Pole Base */}
            <div className='z-10 ml-4 h-24 w-8 rounded-sm border-2 border-orange-800 bg-orange-600 shadow-md'></div>

            {/* Boom Barrier Arm */}
            <div
              className='z-0 mb-20 -ml-4 h-4 w-56 origin-left rounded-r-full border border-slate-300 shadow-lg transition-transform duration-1000 ease-in-out sm:w-72'
              style={{
                transform:
                  gateStatus === 'open' ? 'rotate(-90deg)' : 'rotate(0deg)',
                background:
                  'repeating-linear-gradient(45deg, #ef4444, #ef4444 20px, #ffffff 20px, #ffffff 40px)',
              }}
            >
              {/* End cap for the barrier */}
              <div className='absolute top-0 right-0 bottom-0 w-2 rounded-r-full bg-blue-900'></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

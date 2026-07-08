import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, useParams } from '@tanstack/react-router'
import { ArrowLeft, Loader2, LogOut } from 'lucide-react'
import { format } from 'date-fns'
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
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuthStore } from '@/features/auth/stores/auth-store'
import { useVisitor, useRegisterVisitorExit } from '../api/queries'

const formSchema = z.object({
  exitGateId: z.string().min(1, 'Exit gate is required'),
  remarks: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

export function VisitorExitDetail() {
  const navigate = useNavigate()
  const { visitorId } = useParams({
    from: '/_authenticated/exit-registration/visitor/$visitorId',
  })
  const { auth } = useAuthStore()
  const exitGates = auth.assignedGates.filter((g) => g.type === 'EXIT')

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
          Failed to load visitor details.
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
        Back to Active Visitors
      </Button>

      <div className='grid gap-6 lg:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle className='text-lg'>Visitor Details</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className='space-y-3'>
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className='h-5 w-full' />
                ))}
              </div>
            ) : visitor ? (
              <dl className='space-y-3'>
                <div className='flex justify-between'>
                  <dt className='text-muted-foreground text-sm'>
                    Visitor Name
                  </dt>
                  <dd className='text-sm font-medium'>
                    {visitor.visitorName}
                  </dd>
                </div>
                <div className='flex justify-between'>
                  <dt className='text-muted-foreground text-sm'>
                    NRC / Passport
                  </dt>
                  <dd className='text-sm'>{visitor.nrcOrPassport || '—'}</dd>
                </div>
                <div className='flex justify-between'>
                  <dt className='text-muted-foreground text-sm'>Phone</dt>
                  <dd className='text-sm'>{visitor.phoneNumber || '—'}</dd>
                </div>
                <div className='flex justify-between'>
                  <dt className='text-muted-foreground text-sm'>Company</dt>
                  <dd className='text-sm'>{visitor.companyName || '—'}</dd>
                </div>
                <div className='flex justify-between'>
                  <dt className='text-muted-foreground text-sm'>
                    Purpose of Visit
                  </dt>
                  <dd className='text-sm'>{visitor.purposeOfVisit || '—'}</dd>
                </div>
                <div className='flex justify-between'>
                  <dt className='text-muted-foreground text-sm'>
                    Host Employee
                  </dt>
                  <dd className='text-sm'>{visitor.hostEmployee || '—'}</dd>
                </div>
                <div className='flex justify-between'>
                  <dt className='text-muted-foreground text-sm'>Entry Gate</dt>
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
                  <dt className='text-muted-foreground text-sm'>Entry Time</dt>
                  <dd className='text-sm'>
                    {format(new Date(visitor.entryTime), 'dd/MM/yyyy HH:mm')}
                  </dd>
                </div>
                <div className='flex justify-between'>
                  <dt className='text-muted-foreground text-sm'>Status</dt>
                  <dd>
                    <Badge
                      variant='outline'
                      className='border-blue-500 text-blue-600 text-xs'
                    >
                      {visitor.status}
                    </Badge>
                  </dd>
                </div>
              </dl>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='text-lg'>Register Exit</CardTitle>
          </CardHeader>
          <CardContent>
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
                      <FormLabel>Exit Gate</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Select exit gate' />
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
                      <FormLabel>Remarks</FormLabel>
                      <FormControl>
                        <Textarea
                          rows={3}
                          placeholder='Any remarks...'
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
                      Registering Exit...
                    </>
                  ) : (
                    <>
                      <LogOut className='mr-2 h-4 w-4' />
                      Register Exit
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

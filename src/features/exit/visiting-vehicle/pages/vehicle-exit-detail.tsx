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
import { useState } from 'react'
import { useAuthStore } from '@/features/auth/stores/auth-store'
import { useVehicle, useRegisterVehicleExit } from '../api/queries'

const formSchema = z.object({
  exitGateId: z.string().min(1, 'Exit gate is required'),
  remarks: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

export function VehicleExitDetail() {
  const navigate = useNavigate()
  const { vehicleId } = useParams({
    from: '/_authenticated/exit-registration/visiting-vehicle/$vehicleId',
  })
  const { auth } = useAuthStore()
  const exitGates = auth.assignedGates.filter((g) => g.type === 'EXIT')
  const [gateStatus, setGateStatus] = useState<'closed' | 'open'>('closed')

  const { data: vehicle, isLoading, isError } = useVehicle(vehicleId)
  const { mutate: registerExit, isPending } = useRegisterVehicleExit()

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
        id: vehicleId,
        payload: {
          exitGateId: data.exitGateId,
          remarks: data.remarks || undefined,
        },
      },
      {
        onSuccess: () => {
          navigate({
            to: '/exit-registration/visiting-vehicle',
            replace: true,
          })
        },
      }
    )
  }

  if (isError) {
    return (
      <div className='flex items-center justify-center py-12'>
        <p className='text-destructive text-sm'>
          Failed to load vehicle details.
        </p>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      <Button
        variant='ghost'
        className='-ml-2'
        onClick={() =>
          navigate({ to: '/exit-registration/visiting-vehicle' })
        }
      >
        <ArrowLeft className='mr-1 h-4 w-4' />
        Back to Active Vehicles
      </Button>

      <div className='grid gap-6 lg:grid-cols-2'>
        {/* Vehicle Details Card */}
        <Card>
          <CardHeader>
            <CardTitle className='text-lg'>Vehicle Details</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className='space-y-3'>
                {Array.from({ length: 9 }).map((_, i) => (
                  <Skeleton key={i} className='h-5 w-full' />
                ))}
              </div>
            ) : vehicle ? (
              <div className='space-y-6'>
                <dl className='space-y-3'>
                  <div className='flex justify-between'>
                    <dt className='text-muted-foreground text-sm'>
                      Plate Number
                    </dt>
                    <dd className='text-sm font-medium'>
                      {vehicle.plateNumber}
                    </dd>
                  </div>
                  <div className='flex justify-between'>
                    <dt className='text-muted-foreground text-sm'>
                      Visitor Name
                    </dt>
                    <dd className='text-sm'>{vehicle.visitorName || '—'}</dd>
                  </div>
                  <div className='flex justify-between'>
                    <dt className='text-muted-foreground text-sm'>
                      Vehicle Type
                    </dt>
                    <dd className='text-sm'>{vehicle.vehicleType || '—'}</dd>
                  </div>
                  <div className='flex justify-between'>
                    <dt className='text-muted-foreground text-sm'>
                      Company
                    </dt>
                    <dd className='text-sm'>{vehicle.companyName || '—'}</dd>
                  </div>
                  <div className='flex justify-between'>
                    <dt className='text-muted-foreground text-sm'>Entry Gate</dt>
                    <dd className='text-sm'>
                      {vehicle.entryGate ? (
                        <Badge variant='outline' className='text-xs'>
                          {vehicle.entryGate.name}
                        </Badge>
                      ) : (
                        '—'
                      )}
                    </dd>
                  </div>
                  <div className='flex justify-between'>
                    <dt className='text-muted-foreground text-sm'>Entry Time</dt>
                    <dd className='text-sm'>
                      {format(new Date(vehicle.entryTime), 'dd/MM/yyyy HH:mm')}
                    </dd>
                  </div>
                  <div className='flex justify-between'>
                    <dt className='text-muted-foreground text-sm'>Status</dt>
                    <dd>
                      <Badge
                        variant='outline'
                        className='border-blue-500 text-blue-600 text-xs'
                      >
                        {vehicle.status}
                      </Badge>
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
              </div>
            ) : null}
          </CardContent>
        </Card>

        {/* Barrier Gate Animation Card */}
        <Card>
          <CardHeader>
            <CardTitle className='text-lg'>Gate Control</CardTitle>
          </CardHeader>
          <CardContent>
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
                  OPEN GATE
                </button>
                <button
                  type='button'
                  onClick={() => setGateStatus('closed')}
                  className='flex h-14 w-40 items-center justify-center rounded-lg bg-red-700 text-sm font-bold tracking-wide text-white shadow-md transition-all hover:bg-red-600 hover:shadow-lg active:scale-95'
                >
                  CLOSE GATE
                </button>
              </div>

              {/* Gate Visualization (No Background) */}
              {/* Removed translate-y shift to keep it completely level with the bottom button */}
              <div className='relative flex items-end justify-center'>
                {/* Traffic Light */}
                <div className='z-10 flex h-32 w-16 flex-col items-center justify-center gap-4 rounded-full border-2 border-slate-700 bg-slate-800 shadow-xl'>
                  <div
                    className={`h-10 w-10 rounded-full shadow-inner transition-all duration-300 ${gateStatus === 'open'
                      ? 'bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.7)]'
                      : 'bg-slate-700'
                    }`}
                  ></div>
                  <div
                    className={`h-10 w-10 rounded-full shadow-inner transition-all duration-300 ${gateStatus === 'closed'
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
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

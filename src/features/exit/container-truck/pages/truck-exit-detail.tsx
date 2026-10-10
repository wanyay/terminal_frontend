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
import { StatusBadge } from '@/components/status-badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useEffect, useState } from 'react'
import { useAuthStore } from '@/features/auth/stores/auth-store'
import { useTranslation } from '@/context/language-provider'
import { getT } from '@/lib/i18n'
import { useTruck, useRegisterTruckExit } from '../api/queries'

const formSchema = z.object({
  exitGateId: z.string().min(1, getT('exit.exitGateRequired' as never)),
  remarks: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface RelayState {
  statuses: Array<{ channel: number; isOpen: boolean }>;
  isConnected: boolean;
  deviceInfo: any;
  isLoading: boolean;
  error: string | null;
}

export function TruckExitDetail() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { truckId } = useParams({ from: '/_authenticated/exit-registration/container-truck/$truckId' })
  const { auth } = useAuthStore()
  const exitGates = auth.assignedGates.filter((g) => g.type === 'EXIT')

  const [stateDevice, setDeviceState] = useState<RelayState>({
    statuses: Array.from({ length: 2 }, (_, i) => ({
      channel: i + 1,
      isOpen: false
    })),
    isConnected: false,
    deviceInfo: null,
    isLoading: false,
    error: null
  });

  const [gateStatus, setGateStatus] = useState<'closed' | 'open'>('closed')

  const { data: truck, isLoading, isError } = useTruck(truckId)
  const { mutate: registerExit, isPending } = useRegisterTruckExit()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      exitGateId: exitGates.length > 0 ? exitGates[0].id : '',
      remarks: '',
    },
  })

  // Subscribe to USB status updates once on mount
  useEffect(() => {
    if (!window.usbAPI) return;

    const statusUnsubscribe = window.usbAPI.onStatusUpdate((statusData) => {
      setDeviceState(prev => ({
        ...prev,
        statuses: statusData.statuses || prev.statuses
      }));
      console.log(`📊 Status updated: ${JSON.stringify(statusData)}`);
    });

    return () => {
      statusUnsubscribe();
    };
  }, [])

  /** Relay channels: 2 = open gate, 1 = close gate */
  const OPEN_RELAY_CHANNEL = 2;
  const CLOSE_RELAY_CHANNEL = 1;

  async function ensureConnected() {
    if (!window.usbAPI) {
      throw new Error('USB API not available — not running inside Electron');
    }

    if (stateDevice.isConnected) {
      return; // Already connected
    }

    setDeviceState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const result = await window.usbAPI.connect({
        vendorId: 0x16c0,
        productId: 0x05df,
        configurationValue: 1,
        interfaceNumber: 0,
        endpointIn: 1,
        endpointOut: 2
      });

      if (result) {
        const deviceInfo = await window.usbAPI.getDeviceInfo();
        setDeviceState(prev => ({
          ...prev,
          isConnected: true,
          deviceInfo,
          isLoading: false
        }));
        console.log('✅ Connected to device');

        const status = await window.usbAPI.getStatus();
        if (status) {
          setDeviceState(prev => ({ ...prev, statuses: status.statuses }));
        }
      } else {
        setDeviceState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Failed to connect'
        }));
        throw new Error('Failed to connect to USB device');
      }
    } catch (error: any) {
      setDeviceState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message
      }));
      throw error;
    }
  }

  /** Pulse a relay momentarily (on for 500ms, then off) */
  async function pulseRelay(channel: number) {
    await window.usbAPI!.setRelay(channel, 'on');
    await new Promise(r => setTimeout(r, 500));
    await window.usbAPI!.setRelay(channel, 'off');
  }

  async function handleOpenGate() {
    console.log('🟢 OPEN GATE clicked');

    try {
      await ensureConnected();
      await pulseRelay(OPEN_RELAY_CHANNEL);
      setGateStatus('open');
      console.log('✅ Gate opened (pulsed relay ' + OPEN_RELAY_CHANNEL + ')');
    } catch (error: any) {
      console.log(`❌ Error opening gate: ${error.message}`);
    }
  }

  async function handleCloseGate() {
    console.log('🔴 CLOSE GATE clicked');

    try {
      await ensureConnected();
      await pulseRelay(CLOSE_RELAY_CHANNEL);
      setGateStatus('closed');
      console.log('✅ Gate closed (pulsed relay ' + CLOSE_RELAY_CHANNEL + ')');
    } catch (error: any) {
      console.log(`❌ Error closing gate: ${error.message}`);
      setGateStatus('closed');
    }
  }

  function onSubmit(data: FormValues) {
    registerExit(
      {
        id: truckId,
        payload: {
          exitGateId: data.exitGateId,
          remarks: data.remarks || undefined,
        },
      },
      {
        onSuccess: () => {
          navigate({ to: '/exit-registration/container-truck', replace: true })
        },
      }
    )
  }

  if (isError) {
    return (
      <div className='flex items-center justify-center py-12'>
        <p className='text-destructive text-sm'>{t('exit.failedLoadTruck' as never)}</p>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      <Button
        variant='ghost'
        className='-ml-2'
        onClick={() => navigate({ to: '/exit-registration/container-truck' })}
      >
        <ArrowLeft className='mr-1 h-4 w-4' />
        {t('exit.backToActiveTrucks' as never)}
      </Button>

      <div className='grid gap-6 lg:grid-cols-2'>
        {/* Truck Details Card */}
        <Card>
          <CardHeader>
            <CardTitle className='text-lg'>{t('exit.truckDetails' as never)}</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className='space-y-3'>
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className='h-5 w-full' />
                ))}
              </div>
            ) : truck ? (
              <div className='space-y-6'>
                <dl className='space-y-3'>
                  <div className='flex justify-between'>
                    <dt className='text-muted-foreground text-sm'>{t('exit.licensePlate' as never)}</dt>
                    <dd className='text-sm font-medium'>{truck.licensePlate}</dd>
                  </div>
                  <div className='flex justify-between'>
                    <dt className='text-muted-foreground text-sm'>{t('exit.driverName' as never)}</dt>
                    <dd className='text-sm'>{truck.driverName || '—'}</dd>
                  </div>
                  <div className='flex justify-between'>
                    <dt className='text-muted-foreground text-sm'>{t('exit.driverNrc' as never)}</dt>
                    <dd className='text-sm'>{truck.driverNrc || '—'}</dd>
                  </div>
                  <div className='flex justify-between'>
                    <dt className='text-muted-foreground text-sm'>{t('exit.entryGate' as never)}</dt>
                    <dd className='text-sm'>
                      {truck.entryGate ? (
                        <Badge variant='outline' className='text-xs'>
                          {truck.entryGate.name}
                        </Badge>
                      ) : (
                        '—'
                      )}
                    </dd>
                  </div>
                  <div className='flex justify-between'>
                    <dt className='text-muted-foreground text-sm'>{t('exit.entryTime' as never)}</dt>
                    <dd className='text-sm'>
                      {format(new Date(truck.entryTime), 'dd/MM/yyyy HH:mm')}
                    </dd>
                  </div>
                  <div className='flex justify-between'>
                    <dt className='text-muted-foreground text-sm'>{t('exit.status' as never)}</dt>
                    <dd>
                      <StatusBadge
                        status={truck.status}
                        label={t(`statusBadges.${truck.status.toLowerCase()}` as never)}
                        className='text-xs'
                      />
                    </dd>
                  </div>
                </dl>

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
                    <FormField
                      control={form.control}
                      name='exitGateId'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('exit.exitGate' as never)}</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
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
                    <Button type='submit' className='w-full' disabled={isPending}>
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
        <div className='flex w-full flex-1 flex-col items-center justify-center gap-12 pb-10 sm:flex-row'>
          {/* Gate Control Buttons */}
          <div className='flex shrink-0 flex-col gap-5'>
            <button
              type='button'
              onClick={handleOpenGate}
              disabled={gateStatus === 'open'}
              className={`flex h-14 w-40 items-center justify-center rounded-lg text-sm font-bold tracking-wide text-white shadow-md transition-all ${gateStatus === 'open'
                ? 'cursor-not-allowed bg-gray-500'
                : 'bg-green-600 hover:bg-green-500 hover:shadow-lg active:scale-95'
                }`}
            >
              {t('common.openGate' as never)}
            </button>
            <button
              type='button'
              onClick={handleCloseGate}
              disabled={gateStatus === 'closed'}
              className={`flex h-14 w-40 items-center justify-center rounded-lg text-sm font-bold tracking-wide text-white shadow-md transition-all ${gateStatus === 'closed'
                ? 'cursor-not-allowed bg-gray-500'
                : 'bg-red-700 hover:bg-red-600 hover:shadow-lg active:scale-95'
                }`}
            >
              {t('common.closeGate' as never)}
            </button>
          </div>

          {/* Gate Visualization (No Background) */}
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
      </div>
    </div>
  )
}

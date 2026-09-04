import { useEffect, useRef, useState } from 'react'
import * as z from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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
import { useAuthStore } from '@/features/auth/stores/auth-store'
import { useTranslation } from '@/context/language-provider'
import { getT } from '@/lib/i18n'
import { useCreateVisitingVehicleEntry } from '../api/queries'

const formSchema = z.object({
  licensePlate: z.string().min(1, getT('entry.carNoRequired' as never)),
  driverName: z.string().min(1, getT('entry.visitorNameRequired' as never)),
  driverNrc: z.string().optional(),
  vehicleType: z.string().optional(),
  vehicleModel: z.string().optional(),
  companyName: z.string().optional(),
  purposeOfVisit: z.string().optional(),
  entryGateId: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

export function VisitingVehicleEntryPage() {
  const { t } = useTranslation()
  const createVisitingVehicleEntry = useCreateVisitingVehicleEntry()
  const { auth } = useAuthStore()
  const entryGates = auth.assignedGates.filter((g) => g.type === 'ENTRY')

  const [gateStatus, setGateStatus] = useState<'closed' | 'open'>('closed')
  const hasReset = useRef(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      licensePlate: '',
      driverName: '',
      driverNrc: '',
      vehicleType: '',
      vehicleModel: '',
      companyName: '',
      purposeOfVisit: '',
      entryGateId: entryGates.length > 0 ? String(entryGates[0].id) : '',
    },
  })

  useEffect(() => {
    if (createVisitingVehicleEntry.isSuccess && !hasReset.current) {
      form.reset({
        licensePlate: '',
        driverName: '',
        driverNrc: '',
        vehicleType: '',
        vehicleModel: '',
        companyName: '',
        purposeOfVisit: '',
        entryGateId: entryGates.length > 0 ? String(entryGates[0].id) : '',
      })
      hasReset.current = true
    }
    // Reset the flag when isSuccess becomes false (e.g., when starting a new mutation)
    if (!createVisitingVehicleEntry.isSuccess) {
      hasReset.current = false
    }
  }, [createVisitingVehicleEntry.isSuccess, entryGates, form])

  function onSubmit(values: FormValues) {
    createVisitingVehicleEntry.mutate({
      plateNumber: values.licensePlate,
      visitorName: values.driverName,
      nrcOrLicense: values.driverNrc || undefined,
      vehicleType: values.vehicleType || undefined,
      vehicleModel: values.vehicleModel || undefined,
      companyName: values.companyName || undefined,
      purposeOfVisit: values.purposeOfVisit || undefined,
      entryGateId: values.entryGateId || undefined,
    })
  }

  return (
    <div className='-mt-4 flex min-h-125 flex-col items-center gap-8 p-6 xl:flex-row xl:items-stretch'>
      {/* 1. Form Section */}
      <Card className='flex w-full shrink-0 flex-col shadow-sm xl:w-112.5'>
        <CardContent className='flex-1 pt-6'>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
              <FormField
                control={form.control}
                name='licensePlate'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('entry.carNo' as never)}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('entry.licensePlateExample' as never)} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='driverName'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('entry.visitorName' as never)}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('entry.johnDoe' as never)} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='driverNrc'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('entry.nrcOrLicense' as never)}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('entry.nrcExample' as never)} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className='grid grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='vehicleType'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('entry.vehicleType' as never)}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('entry.vehicleTypeExample' as never)} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='vehicleModel'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('entry.vehicleModel' as never)}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('entry.vehicleModelExample' as never)} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name='companyName'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('entry.companyName' as never)}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('entry.companyExample' as never)} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='purposeOfVisit'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('entry.purposeOfVisit' as never)}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('entry.purposeExample' as never)} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='entryGateId'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('entry.entryGate' as never)}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('entry.selectEntryGate' as never)} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {entryGates.map((gate) => (
                          <SelectItem key={gate.id} value={String(gate.id)}>
                            {gate.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type='submit'
                className='w-full'
                disabled={createVisitingVehicleEntry.isPending}
              >
                {createVisitingVehicleEntry.isPending
                  ? t('common.submitting' as never)
                  : t('entry.submitEntry' as never)}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

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
  )
}

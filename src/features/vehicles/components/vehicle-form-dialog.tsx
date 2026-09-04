import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Car, User, ClipboardList, DoorOpen, ChevronDown } from 'lucide-react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog'
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { useAuthStore } from '@/features/auth/stores/auth-store'
import { useTranslation } from '@/context/language-provider'
import {
  useRegisterVehicleEntry, useUpdateVehicle, type Vehicle,
} from '../api/queries'

const entrySchema = z.object({
  plateNumber: z.string().min(1, 'vehicles.plateNumberRequired' as never).max(20),
  visitorName: z.string().min(1, 'vehicles.visitorNameRequired' as never).max(100),
  vehicleType: z.string().max(50).optional().or(z.literal('')),
  vehicleModel: z.string().max(50).optional().or(z.literal('')),
  nrcOrLicense: z.string().max(50).optional().or(z.literal('')),
  companyName: z.string().max(100).optional().or(z.literal('')),
  purposeOfVisit: z.string().max(255).optional().or(z.literal('')),
  entryGateId: z.string().min(1, 'vehicles.entryGateRequired' as never),
  remarks: z.string().max(500).optional().or(z.literal('')),
})

const editSchema = z.object({
  plateNumber: z.string().min(1).max(20),
  visitorName: z.string().min(1).max(100),
  vehicleType: z.string().max(50).optional().or(z.literal('')),
  vehicleModel: z.string().max(50).optional().or(z.literal('')),
  nrcOrLicense: z.string().max(50).optional().or(z.literal('')),
  companyName: z.string().max(100).optional().or(z.literal('')),
  purposeOfVisit: z.string().max(255).optional().or(z.literal('')),
  remarks: z.string().max(500).optional().or(z.literal('')),
})

type EntryFormValues = z.infer<typeof entrySchema>
type EditFormValues = z.infer<typeof editSchema>

interface Props {
  open: boolean; onOpenChange: (open: boolean) => void; vehicle?: Vehicle | null
}

export function VehicleFormDialog({ open, onOpenChange, vehicle }: Props) {
  const isEditing = !!vehicle
  const { mutate: register, isPending: registering } = useRegisterVehicleEntry()
  const { mutate: update, isPending: updating } = useUpdateVehicle(vehicle?.id ?? '')
  const pending = registering || updating
  const { auth } = useAuthStore()
  const { t } = useTranslation()
  const entryGates = auth.assignedGates.filter((g) => g.type === 'ENTRY')

  const entryForm = useForm<EntryFormValues>({
    resolver: zodResolver(entrySchema),
    defaultValues: { plateNumber: '', visitorName: '', vehicleType: '', vehicleModel: '', nrcOrLicense: '', companyName: '', purposeOfVisit: '', entryGateId: '', remarks: '' },
  })
  const editForm = useForm<EditFormValues>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      plateNumber: vehicle?.plateNumber ?? '', visitorName: vehicle?.visitorName ?? '',
      vehicleType: vehicle?.vehicleType ?? '', vehicleModel: vehicle?.vehicleModel ?? '',
      nrcOrLicense: vehicle?.nrcOrLicense ?? '', companyName: vehicle?.companyName ?? '',
      purposeOfVisit: vehicle?.purposeOfVisit ?? '', remarks: vehicle?.remarks ?? '',
    },
  })

  useEffect(() => {
    if (isEditing && vehicle) editForm.reset({
      plateNumber: vehicle.plateNumber, visitorName: vehicle.visitorName,
      vehicleType: vehicle.vehicleType ?? '', vehicleModel: vehicle.vehicleModel ?? '',
      nrcOrLicense: vehicle.nrcOrLicense ?? '', companyName: vehicle.companyName ?? '',
      purposeOfVisit: vehicle.purposeOfVisit ?? '', remarks: vehicle.remarks ?? '',
    })
  }, [vehicle, isEditing, editForm])

  const clean = (v: string) => v || undefined

  function handleRegister(d: EntryFormValues) {
    register({
      ...d,
      vehicleType: clean(d.vehicleType ?? ''), vehicleModel: clean(d.vehicleModel ?? ''),
      nrcOrLicense: clean(d.nrcOrLicense ?? ''), companyName: clean(d.companyName ?? ''),
      purposeOfVisit: clean(d.purposeOfVisit ?? ''), remarks: clean(d.remarks ?? ''),
    }, { onSuccess: () => { entryForm.reset(); onOpenChange(false) } })
  }

  function handleUpdate(d: EditFormValues) {
    if (!vehicle) return
    update({
      ...d,
      vehicleType: clean(d.vehicleType ?? ''), vehicleModel: clean(d.vehicleModel ?? ''),
      nrcOrLicense: clean(d.nrcOrLicense ?? ''), companyName: clean(d.companyName ?? ''),
      purposeOfVisit: clean(d.purposeOfVisit ?? ''), remarks: clean(d.remarks ?? ''),
    }, { onSuccess: () => onOpenChange(false) })
  }

  if (!isEditing) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className='sm:max-w-[560px] max-h-[90vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <Car className='h-5 w-5 text-blue-600' /> {t('vehicles.registerVehicleEntry' as never)}
            </DialogTitle>
            <DialogDescription>{t('vehicles.registerVehicleEntryDesc' as never)}</DialogDescription>
          </DialogHeader>
          <Form {...entryForm}>
            <form onSubmit={entryForm.handleSubmit(handleRegister)} className='space-y-5'>
              {/* License Plate Badge */}
              <div className='flex justify-center'>
                <div className='inline-flex items-center gap-3 rounded-xl border-2 bg-slate-50 px-6 py-3 dark:bg-slate-900'>
                  <div className='rounded bg-blue-600 px-2 py-0.5 text-xs font-bold text-white'>{t('vehicles.myanmar' as never)}</div>
                  <FormField control={entryForm.control} name='plateNumber' render={({ field }) => (
                    <div className='text-center'>
                      <FormControl><Input placeholder={t('vehicles.plateExample' as never)} {...field} className='h-10 w-40 border-0 bg-transparent text-center text-xl font-mono font-bold tracking-widest uppercase shadow-none focus-visible:ring-0' /></FormControl>
                      <FormMessage className='text-xs' />
                    </div>
                  )} />
                </div>
              </div>

              {/* Vehicle Details */}
              <Card>
                <CardContent className='space-y-4 pt-4'>
                  <div className='flex items-center gap-2 text-sm font-semibold text-muted-foreground'><Car className='h-4 w-4' /> {t('vehicles.vehicleDetails' as never)}</div>
                  <div className='grid grid-cols-2 gap-4'>
                    <FormField control={entryForm.control} name='vehicleType' render={({ field }) => (
                      <FormItem><FormLabel>{t('vehicles.type' as never)}</FormLabel><FormControl><Input placeholder={t('vehicles.vehicleTypeExample' as never)} {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={entryForm.control} name='vehicleModel' render={({ field }) => (
                      <FormItem><FormLabel>{t('vehicles.model' as never)}</FormLabel><FormControl><Input placeholder={t('vehicles.vehicleModelExample' as never)} {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>
                </CardContent>
              </Card>

              {/* Visitor Details */}
              <Card>
                <CardContent className='space-y-4 pt-4'>
                  <div className='flex items-center gap-2 text-sm font-semibold text-muted-foreground'><User className='h-4 w-4' /> {t('vehicles.visitorDetails' as never)}</div>
                  <FormField control={entryForm.control} name='visitorName' render={({ field }) => (
                    <FormItem><FormLabel>{t('vehicles.visitorNameRequiredStar' as never)}</FormLabel><FormControl><Input placeholder={t('vehicles.johnDoe' as never)} {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <div className='grid grid-cols-2 gap-4'>
                    <FormField control={entryForm.control} name='nrcOrLicense' render={({ field }) => (
                      <FormItem><FormLabel>{t('vehicles.nrcOrLicense' as never)}</FormLabel><FormControl><Input placeholder={t('vehicles.nrcExample' as never)} {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={entryForm.control} name='companyName' render={({ field }) => (
                      <FormItem><FormLabel>{t('vehicles.companyName' as never)}</FormLabel><FormControl><Input placeholder={t('vehicles.companyExample' as never)} {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>
                  <FormField control={entryForm.control} name='purposeOfVisit' render={({ field }) => (
                    <FormItem><FormLabel>{t('vehicles.purposeOfVisit' as never)}</FormLabel><FormControl><Input placeholder={t('vehicles.purposeExample' as never)} {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </CardContent>
              </Card>

              {/* Entry Gate */}
              <Card>
                <CardContent className='space-y-4 pt-4'>
                  <div className='flex items-center gap-2 text-sm font-semibold text-muted-foreground'><DoorOpen className='h-4 w-4' /> {t('vehicles.entryPoint' as never)}</div>
                  <FormField control={entryForm.control} name='entryGateId' render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('vehicles.entryGateRequiredStar' as never)}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger className='h-12'><SelectValue placeholder={t('vehicles.selectEntryGate' as never)} /></SelectTrigger></FormControl>
                        <SelectContent>{entryGates.map((g) => (<SelectItem key={g.id} value={g.id}>{g.code} — {g.name}</SelectItem>))}</SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                </CardContent>
              </Card>

              {/* Remarks */}
              <Collapsible>
                <CollapsibleTrigger asChild>
                  <Button variant='ghost' size='sm' className='flex w-full items-center gap-2 text-muted-foreground'>
                    <ClipboardList className='h-4 w-4' /> {t('vehicles.additionalNotes' as never)} <ChevronDown className='ml-auto h-4 w-4' />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className='pt-2'>
                  <FormField control={entryForm.control} name='remarks' render={({ field }) => (
                    <FormItem><FormControl><Textarea placeholder={t('vehicles.optionalRemarks' as never)} className='resize-none' rows={2} {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </CollapsibleContent>
              </Collapsible>

              <div className='flex justify-end gap-3 pt-1'>
                <Button type='button' variant='outline' onClick={() => onOpenChange(false)} disabled={pending}>{t('common.cancel' as never)}</Button>
                <Button type='submit' disabled={pending} size='lg'>{registering && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}{t('vehicles.registerEntry' as never)}</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    )
  }

  // --- Edit Form ---
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle>{t('vehicles.editVehicle' as never)}</DialogTitle>
          <DialogDescription>{t('vehicles.updateRecordPrefix' as never, { plate: vehicle?.plateNumber })}</DialogDescription>
        </DialogHeader>
        <Form {...editForm}>
          <form onSubmit={editForm.handleSubmit(handleUpdate)} className='space-y-4'>
            <FormField control={editForm.control} name='plateNumber' render={({ field }) => (
              <FormItem><FormLabel>{t('vehicles.plateNumber' as never)}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={editForm.control} name='visitorName' render={({ field }) => (
              <FormItem><FormLabel>{t('vehicles.visitor' as never)}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <div className='grid grid-cols-2 gap-4'>
              <FormField control={editForm.control} name='vehicleType' render={({ field }) => (<FormItem><FormLabel>{t('vehicles.type' as never)}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={editForm.control} name='vehicleModel' render={({ field }) => (<FormItem><FormLabel>{t('vehicles.model' as never)}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
            </div>
            <div className='grid grid-cols-2 gap-4'>
              <FormField control={editForm.control} name='nrcOrLicense' render={({ field }) => (<FormItem><FormLabel>{t('vehicles.nrcOrLicense' as never)}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={editForm.control} name='companyName' render={({ field }) => (<FormItem><FormLabel>{t('vehicles.companyName' as never)}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
            </div>
            <FormField control={editForm.control} name='purposeOfVisit' render={({ field }) => (<FormItem><FormLabel>{t('vehicles.purpose' as never)}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={editForm.control} name='remarks' render={({ field }) => (<FormItem><FormLabel>{t('vehicles.remarks' as never)}</FormLabel><FormControl><Textarea className='resize-none' rows={2} {...field} /></FormControl><FormMessage /></FormItem>)} />
            <div className='flex justify-end gap-3'><Button type='button' variant='outline' onClick={() => onOpenChange(false)} disabled={pending}>{t('common.cancel' as never)}</Button><Button type='submit' disabled={pending}>{updating && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}{t('common.update' as never)}</Button></div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

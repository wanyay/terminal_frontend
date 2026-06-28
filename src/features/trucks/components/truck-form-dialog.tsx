import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuthStore } from '@/features/auth/stores/auth-store'
import { useCreateTruck, useUpdateTruck, type Truck } from '../api/queries'

const formSchema = z.object({
  licensePlate: z.string().min(1, 'License plate is required'),
  containerNumber: z.string().optional(),
  driverName: z.string().optional(),
  driverNrc: z.string().optional(),
  entryGateId: z.string().optional(),
  remarks: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  truck?: Truck
}

export function TruckFormDialog({ open, onOpenChange, truck }: Props) {
  const isEdit = !!truck
  const createTruck = useCreateTruck()
  const updateTruck = useUpdateTruck(truck?.id ?? '')
  const { auth } = useAuthStore()
  const entryGates = auth.assignedGates.filter((g) => g.type === 'ENTRY')

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      licensePlate: truck?.licensePlate ?? '',
      containerNumber: truck?.containerNumber ?? '',
      driverName: truck?.driverName ?? '',
      driverNrc: truck?.driverNrc ?? '',
      entryGateId: truck?.entryGateId ?? '',
      remarks: truck?.remarks ?? '',
    },
  })

  useEffect(() => {
    form.reset({
      licensePlate: truck?.licensePlate ?? '',
      containerNumber: truck?.containerNumber ?? '',
      driverName: truck?.driverName ?? '',
      driverNrc: truck?.driverNrc ?? '',
      entryGateId: truck?.entryGateId ?? '',
      remarks: truck?.remarks ?? '',
    })
  }, [truck, form])

  function onSubmit(values: FormValues) {
    const payload = {
      ...values,
      containerNumber: values.containerNumber || undefined,
      driverName: values.driverName || undefined,
      driverNrc: values.driverNrc || undefined,
      entryGateId: values.entryGateId || undefined,
      remarks: values.remarks || undefined,
    }

    if (isEdit && truck) {
      updateTruck.mutate(payload, {
        onSuccess: () => onOpenChange(false),
      })
      return
    }

    createTruck.mutate(payload, {
      onSuccess: () => {
        form.reset()
        onOpenChange(false)
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-xl'>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Container Truck' : 'Register Container Truck Entry'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <div className='grid gap-4 md:grid-cols-2'>
              <FormField control={form.control} name='licensePlate' render={({ field }) => (
                <FormItem>
                  <FormLabel>License Plate</FormLabel>
                  <FormControl><Input placeholder='YGN-1234' {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name='containerNumber' render={({ field }) => (
                <FormItem>
                  <FormLabel>Container Number</FormLabel>
                  <FormControl><Input placeholder='CONT-5678' {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name='driverName' render={({ field }) => (
                <FormItem>
                  <FormLabel>Driver Name</FormLabel>
                  <FormControl><Input placeholder='John Doe' {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name='driverNrc' render={({ field }) => (
                <FormItem>
                  <FormLabel>Driver NRC</FormLabel>
                  <FormControl><Input placeholder='12/ABC(N)123456' {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name='entryGateId' render={({ field }) => (
                <FormItem>
                  <FormLabel>Entry Gate</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Select entry gate' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {entryGates.map((gate) => (
                        <SelectItem key={gate.id} value={gate.id}>
                          {gate.code} — {gate.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <FormField control={form.control} name='remarks' render={({ field }) => (
              <FormItem>
                <FormLabel>Remarks</FormLabel>
                <FormControl><Textarea rows={4} placeholder='Any remarks...' {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <div className='flex justify-end gap-2'>
              <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type='submit' disabled={createTruck.isPending || updateTruck.isPending}>{isEdit ? 'Save Changes' : 'Register Entry'}</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

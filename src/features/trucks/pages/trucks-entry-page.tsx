import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Plus } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuthStore } from '@/features/auth/stores/auth-store'
import { useCreateTruck } from '../api/queries'

const formSchema = z.object({
  licensePlate: z.string().min(1, 'License plate is required'),
  driverName: z.string().optional(),
  driverNrc: z.string().optional(),
  entryGateId: z.string().min(1, 'Entry gate is required'),
  remarks: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

export function TrucksEntryPage() {
  const createTruck = useCreateTruck()
  const { auth } = useAuthStore()
  const entryGates = auth.assignedGates.filter((g) => g.type === 'ENTRY')

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      licensePlate: '',
      driverName: '',
      driverNrc: '',
      entryGateId: '',
      remarks: '',
    },
  })

  useEffect(() => {
    if (createTruck.isSuccess) {
      form.reset()
    }
  }, [createTruck.isSuccess, form])

  function onSubmit(values: FormValues) {
    createTruck.mutate({
      ...values,
      driverName: values.driverName || undefined,
      driverNrc: values.driverNrc || undefined,
      remarks: values.remarks || undefined,
    })
  }

  return (
    <>
      <Header>
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>
      <Main>
        <div className='mb-6'>
          <h1 className='text-2xl font-bold tracking-tight'>Entry Container Truck</h1>
          <p className='text-muted-foreground text-sm'>Register a new truck entry and capture its initial details.</p>
        </div>
        <Card className='max-w-xl'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'><Plus className='h-5 w-5' /> New Truck Entry</CardTitle>
            <CardDescription>Use this form to register a container truck when it enters the port.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
                <FormField control={form.control} name='licensePlate' render={({ field }) => (
                  <FormItem>
                    <FormLabel>Car No</FormLabel>
                    <FormControl><Input placeholder='YGN-1234' {...field} /></FormControl>
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
                <FormField control={form.control} name='remarks' render={({ field }) => (
                  <FormItem>
                    <FormLabel>Remarks</FormLabel>
                    <FormControl><Textarea rows={4} placeholder='Any remarks...' {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className='flex justify-end'>
                  <Button type='submit' disabled={createTruck.isPending}>Register Entry</Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </Main>
    </>
  )
}

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
import { useGates, type Gate } from '@/features/gates/api/queries'

const filterSchema = z.object({
  search: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  entryGateId: z.string().optional(),
  exitGateId: z.string().optional(),
})

export type TruckReportFiltersFormValues = z.infer<typeof filterSchema>

interface TruckReportFiltersProps {
  values: {
    search: string
    startDate?: string
    endDate?: string
    entryGateId?: string
    exitGateId?: string
  }
  onSubmit: (values: TruckReportFiltersFormValues) => void
  onReset: () => void
}

export function TruckReportFilters({
  values,
  onSubmit,
  onReset,
}: TruckReportFiltersProps) {
  const { data: gatesData } = useGates({ perPage: 100 })
  const gates = (gatesData?.data ?? []).filter((gate: Gate) => gate.isActive)

  const form = useForm<TruckReportFiltersFormValues>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      search: values.search ?? '',
      startDate: values.startDate ? new Date(values.startDate) : undefined,
      endDate: values.endDate ? new Date(values.endDate) : undefined,
      entryGateId: values.entryGateId ?? undefined,
      exitGateId: values.exitGateId ?? undefined,
    },
  })

  useEffect(() => {
    form.reset({
      search: values.search ?? '',
      startDate: values.startDate ? new Date(values.startDate) : undefined,
      endDate: values.endDate ? new Date(values.endDate) : undefined,
      entryGateId: values.entryGateId ?? undefined,
      exitGateId: values.exitGateId ?? undefined,
    })
  }, [form, values])

  const handleSubmit = (data: TruckReportFiltersFormValues) => {
    onSubmit(data)
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className='bg-card grid gap-4 rounded-lg border p-4 lg:grid-cols-[1.4fr_0.8fr_0.8fr_0.8fr_0.8fr_auto_auto]'
      >
        <FormField
          control={form.control}
          name='search'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Search</FormLabel>
              <FormControl>
                <div className='relative'>
                  <Search className='text-muted-foreground absolute top-2.5 left-2 h-4 w-4' />
                  <Input
                    placeholder='License plate, container, driver...'
                    className='pl-8'
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
              <FormLabel>Start Date</FormLabel>
              <FormControl>
                <DatePicker
                  selected={field.value}
                  onSelect={field.onChange}
                  placeholder='Start date'
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
              <FormLabel>End Date</FormLabel>
              <FormControl>
                <DatePicker
                  selected={field.value}
                  onSelect={field.onChange}
                  placeholder='End date'
                />
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
              <FormLabel>Entry Gate</FormLabel>
              <Select
                onValueChange={(value) =>
                  field.onChange(value === '__all__' ? undefined : value)
                }
                value={field.value || '__all__'}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder='All entry gates' />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value='__all__'>All entry gates</SelectItem>
                  {gates
                    .filter((gate: Gate) => gate.type === 'ENTRY')
                    .map((gate: Gate) => (
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
          name='exitGateId'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Exit Gate</FormLabel>
              <Select
                onValueChange={(value) =>
                  field.onChange(value === '__all__' ? undefined : value)
                }
                value={field.value || '__all__'}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder='All exit gates' />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value='__all__'>All exit gates</SelectItem>
                  {gates
                    .filter((gate: Gate) => gate.type === 'EXIT')
                    .map((gate: Gate) => (
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

        <div className='flex items-end gap-2'>
          <Button type='submit' className='w-full'>
            Apply
          </Button>
        </div>
        <div className='flex items-end gap-2'>
          <Button
            type='button'
            variant='outline'
            className='w-full'
            onClick={() => {
              form.reset({
                search: '',
                startDate: undefined,
                endDate: undefined,
                entryGateId: undefined,
                exitGateId: undefined,
              })
              onReset()
            }}
          >
            <RotateCcw className='mr-2 h-4 w-4' />
            Reset
          </Button>
        </div>
      </form>
    </Form>
  )
}

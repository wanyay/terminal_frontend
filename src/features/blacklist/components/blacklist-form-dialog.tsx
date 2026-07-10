import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
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
import { Textarea } from '@/components/ui/textarea'
import {
  useCreateBlacklistEntry,
  useUpdateBlacklistEntry,
  type BlacklistEntry,
} from '../api/queries'

const formSchema = z.object({
  type: z.enum(['license_plate', 'nrc_passport']),
  value: z
    .string()
    .min(1, 'Value is required')
    .max(255, 'Value must be at most 255 characters'),
  reason: z.string().max(500).optional().or(z.literal('')),
})

type FormValues = z.infer<typeof formSchema>

interface BlacklistFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  entry?: BlacklistEntry | null
}

export function BlacklistFormDialog({
  open,
  onOpenChange,
  entry,
}: BlacklistFormDialogProps) {
  const isEditing = !!entry
  const { mutate: createEntry, isPending: isCreating } =
    useCreateBlacklistEntry()
  const { mutate: updateEntry, isPending: isUpdating } =
    useUpdateBlacklistEntry(entry?.id ?? '')
  const isPending = isCreating || isUpdating

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: entry?.type ?? 'license_plate',
      value: entry?.value ?? '',
      reason: entry?.reason ?? '',
    },
  })

  function onSubmit(data: FormValues) {
    const payload = {
      type: data.type,
      value: data.value,
      reason: data.reason || undefined,
    }

    if (isEditing && entry) {
      updateEntry(payload, {
        onSuccess: () => {
          form.reset()
          onOpenChange(false)
        },
      })
    } else {
      createEntry(payload, {
        onSuccess: () => {
          form.reset()
          onOpenChange(false)
        },
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-125'>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Blacklist Entry' : 'Add to Blacklist'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update the blacklist entry details below.'
              : 'Fill in the details to add a new entry to the blacklist.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='type'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Select type' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value='license_plate'>
                        License Plate
                      </SelectItem>
                      <SelectItem value='nrc_passport'>NRC/Passport</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='value'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Value</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={
                        field.value === 'license_plate'
                          ? 'e.g. ABC-1234'
                          : 'e.g. NRC number or passport number'
                      }
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='reason'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='Reason for adding to blacklist...'
                      className='resize-none'
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='flex justify-end gap-3 pt-2'>
              <Button
                type='button'
                variant='outline'
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type='submit' disabled={isPending}>
                {isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                {isEditing ? 'Update Entry' : 'Add Entry'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

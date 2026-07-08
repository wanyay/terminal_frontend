import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
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
import { Button } from '@/components/ui/button'
import { useCreateGate, useUpdateGate, type Gate } from '../api/queries'

const formSchema = z.object({
  name: z
    .string()
    .min(1, 'Gate name is required')
    .max(100, 'Gate name must be at most 100 characters'),
  type: z.enum(['ENTRY', 'EXIT']),
  description: z.string().max(255).optional().or(z.literal('')),
})

type FormValues = z.infer<typeof formSchema>

interface GateFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  gate?: Gate | null
}

export function GateFormDialog({
  open,
  onOpenChange,
  gate,
}: GateFormDialogProps) {
  const isEditing = !!gate
  const { mutate: createGate, isPending: isCreating } = useCreateGate()
  const { mutate: updateGate, isPending: isUpdating } = useUpdateGate(
    gate?.id ?? '',
  )
  const isPending = isCreating || isUpdating

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: gate?.name ?? '',
      type: gate?.type ?? 'ENTRY',
      description: gate?.description ?? '',
    },
  })

  function onSubmit(data: FormValues) {
    const payload = {
      name: data.name,
      type: data.type,
      description: data.description || undefined,
    }

    if (isEditing && gate) {
      updateGate(payload, {
        onSuccess: () => {
          form.reset()
          onOpenChange(false)
        },
      })
    } else {
      createGate(payload, {
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
          <DialogTitle>{isEditing ? 'Edit Gate' : 'Create Gate'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update the gate details below.'
              : 'Fill in the details to create a new gate.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gate Name</FormLabel>
                  <FormControl>
                    <Input placeholder='e.g. Entry Gate 1' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='type'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gate Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Select gate type' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value='ENTRY'>Entry</SelectItem>
                      <SelectItem value='EXIT'>Exit</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='description'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='Optional description...'
                      className='resize-none'
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
                {isPending && (
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                )}
                {isEditing ? 'Update Gate' : 'Create Gate'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

import { useEffect } from 'react'
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
import { useTranslation } from '@/context/language-provider'
import { useCreateGate, useUpdateGate, type Gate } from '../api/queries'

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
  const { t } = useTranslation()
  const isEditing = !!gate

  const formSchema = z.object({
    code: z
      .string()
      .min(1, t('gates.gateCodeRequired' as never))
      .max(50, t('gates.gateCodeMax' as never)),
    name: z
      .string()
      .min(1, t('gates.gateNameRequired' as never))
      .max(100, t('gates.gateNameMax' as never)),
    type: z.enum(['ENTRY', 'EXIT']),
    description: z.string().max(255).optional().or(z.literal('')),
  })

  type FormValues = z.infer<typeof formSchema>

  const { mutate: createGate, isPending: isCreating } = useCreateGate()
  const { mutate: updateGate, isPending: isUpdating } = useUpdateGate(
    gate?.id ?? '',
  )
  const isPending = isCreating || isUpdating

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: '',
      name: '',
      type: 'ENTRY',
      description: '',
    },
  })

  useEffect(() => {
    if (!open) return

    if (isEditing && gate) {
      form.reset({
        code: gate.code,
        name: gate.name,
        type: gate.type,
        description: gate.description ?? '',
      })
    } else if (!isEditing) {
      form.reset({
        code: '',
        name: '',
        type: 'ENTRY',
        description: '',
      })
    }
  }, [open, gate, isEditing, form])

  function onSubmit(data: FormValues) {
    const payload = {
      code: data.code,
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
          <DialogTitle>{isEditing ? t('gates.editGate' as never) : t('gates.createGate' as never)}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? t('gates.editGateDesc' as never)
              : t('gates.createGateDesc' as never)}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='code'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('gates.gateCode' as never)}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('gates.codeExample' as never)} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('gates.gateName' as never)}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('gates.nameExample' as never)} {...field} />
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
                  <FormLabel>{t('gates.gateType' as never)}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('gates.selectGateType' as never)} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value='ENTRY'>{t('gates.entry' as never)}</SelectItem>
                      <SelectItem value='EXIT'>{t('gates.exit' as never)}</SelectItem>
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
                  <FormLabel>{t('gates.description' as never)}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t('gates.descriptionExample' as never)}
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
                {t('common.cancel' as never)}
              </Button>
              <Button type='submit' disabled={isPending}>
                {isPending && (
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                )}
                {isEditing ? t('gates.updateGate' as never) : t('gates.createGate' as never)}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

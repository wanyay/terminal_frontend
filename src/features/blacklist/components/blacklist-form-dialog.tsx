import { useEffect } from 'react'
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
import { useTranslation } from '@/context/language-provider'
import {
  useCreateBlacklistEntry,
  useUpdateBlacklistEntry,
  type BlacklistEntry,
} from '../api/queries'

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
  const { t } = useTranslation()
  const isEditing = !!entry

  const formSchema = z.object({
    type: z.enum(['license_plate', 'nrc_passport']),
    value: z
      .string()
      .min(1, t('blacklist.valueRequired' as never))
      .max(255, t('blacklist.valueMax' as never)),
    reason: z.string().max(500).optional().or(z.literal('')),
  })

  type FormValues = z.infer<typeof formSchema>

  const { mutate: createEntry, isPending: isCreating } =
    useCreateBlacklistEntry()
  const { mutate: updateEntry, isPending: isUpdating } =
    useUpdateBlacklistEntry(entry?.id ?? '')
  const isPending = isCreating || isUpdating

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: 'license_plate',
      value: '',
      reason: '',
    },
  })

  useEffect(() => {
    if (!open) return

    if (isEditing && entry) {
      form.reset({
        type: entry.type,
        value: entry.value,
        reason: entry.reason ?? '',
      })
    } else if (!isEditing) {
      form.reset({
        type: 'license_plate',
        value: '',
        reason: '',
      })
    }
  }, [open, entry, isEditing, form])

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
            {isEditing ? t('blacklist.editEntry' as never) : t('blacklist.addToBlacklist' as never)}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? t('blacklist.editEntryDesc' as never)
              : t('blacklist.addEntryDesc' as never)}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='type'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('blacklist.type' as never)}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('blacklist.selectType' as never)} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value='license_plate'>
                        {t('blacklist.licensePlate' as never)}
                      </SelectItem>
                      <SelectItem value='nrc_passport'>{t('blacklist.nrcPassport' as never)}</SelectItem>
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
                  <FormLabel>{t('blacklist.value' as never)}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={
                        field.value === 'license_plate'
                          ? t('blacklist.licensePlateExample' as never)
                          : t('blacklist.nrcPassportExample' as never)
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
                  <FormLabel>{t('blacklist.reason' as never)}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t('blacklist.reasonExample' as never)}
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
                {t('common.cancel' as never)}
              </Button>
              <Button type='submit' disabled={isPending}>
                {isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                {isEditing ? t('blacklist.updateEntry' as never) : t('blacklist.addEntry' as never)}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

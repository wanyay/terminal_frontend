import { Loader2 } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useTranslation } from '@/context/language-provider'
import { useDeleteBlacklistEntry, type BlacklistEntry } from '../api/queries'

interface BlacklistDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  entry: BlacklistEntry | null
}

export function BlacklistDeleteDialog({
  open,
  onOpenChange,
  entry,
}: BlacklistDeleteDialogProps) {
  const { t } = useTranslation()
  const { mutate: deleteEntry, isPending } = useDeleteBlacklistEntry()

  function handleDelete() {
    if (!entry) return
    deleteEntry(entry.id, {
      onSuccess: () => {
        onOpenChange(false)
      },
    })
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className='sm:max-w-106.25'>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('blacklist.deleteEntry' as never)}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('blacklist.deleteEntryConfirm' as never, { value: entry?.value ?? '' })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>{t('common.cancel' as never)}</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              handleDelete()
            }}
            disabled={isPending}
            className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
          >
            {isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            {t('common.delete' as never)}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

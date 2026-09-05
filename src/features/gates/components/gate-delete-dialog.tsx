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
import { useDeleteGate, type Gate } from '../api/queries'

interface GateDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  gate: Gate | null
}

export function GateDeleteDialog({
  open,
  onOpenChange,
  gate,
}: GateDeleteDialogProps) {
  const { t } = useTranslation()
  const { mutate: deleteGate, isPending } = useDeleteGate()

  function handleDelete() {
    if (!gate) return
    deleteGate(gate.id, {
      onSuccess: () => {
        onOpenChange(false)
      },
    })
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className='sm:max-w-[425px]'>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('gates.deleteGate' as never)}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('gates.deleteGateConfirm' as never, { code: gate?.code ?? '', name: gate?.name ?? '' })}
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
            {isPending && (
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
            )}
            {t('common.delete' as never)}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

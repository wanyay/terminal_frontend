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
import { useDeleteVisitor, type Visitor } from '../api/queries'

interface VisitorDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  visitor: Visitor | null
}

export function VisitorDeleteDialog({
  open,
  onOpenChange,
  visitor,
}: VisitorDeleteDialogProps) {
  const { mutate: deleteVisitor, isPending } = useDeleteVisitor()
  const { t } = useTranslation()

  function handleDelete() {
    if (!visitor) return
    deleteVisitor(visitor.id, {
      onSuccess: () => {
        onOpenChange(false)
      },
    })
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className='sm:max-w-106.25'>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('visitors.deleteVisitor' as never)}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('visitors.deleteVisitorConfirm' as never, { name: visitor?.visitorName ?? '' })}
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

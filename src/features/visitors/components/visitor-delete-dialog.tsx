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
      <AlertDialogContent className='sm:max-w-[425px]'>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Visitor</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete visitor{' '}
            <strong>{visitor?.visitorName}</strong>? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
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
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

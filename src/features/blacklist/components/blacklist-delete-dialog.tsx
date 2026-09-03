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
          <AlertDialogTitle>Delete Blacklist Entry</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this blacklist entry for{' '}
            <strong>{entry?.value}</strong>? This action cannot be undone.
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
            {isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

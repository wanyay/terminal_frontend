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
          <AlertDialogTitle>Delete Gate</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete gate{' '}
            <strong>{gate?.code}</strong> — {gate?.name}? This action cannot be
            undone.
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

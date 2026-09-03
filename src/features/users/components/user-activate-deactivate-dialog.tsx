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
import { useActivateUser, useDeactivateUser, type User } from '../api/queries'

interface UserActivateDeactivateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: User | null
  action: 'activate' | 'deactivate'
}

export function UserActivateDeactivateDialog({
  open,
  onOpenChange,
  user,
  action,
}: UserActivateDeactivateDialogProps) {
  const { mutate: activateUser, isPending: isActivating } = useActivateUser()
  const { mutate: deactivateUser, isPending: isDeactivating } = useDeactivateUser()
  const isPending = isActivating || isDeactivating

  function handleAction() {
    if (!user) return
    const mutation = action === 'activate' ? activateUser : deactivateUser
    mutation(user.id, {
      onSuccess: () => {
        onOpenChange(false)
      },
    })
  }

  const displayName = user?.fullName || user?.username || ''
  const title = action === 'activate' ? 'Activate User' : 'Deactivate User'
  const buttonText = action === 'activate' ? 'Activate' : 'Deactivate'
  const buttonClass = action === 'activate' 
    ? 'bg-green-600 text-white hover:bg-green-700' 
    : 'bg-destructive text-destructive-foreground hover:bg-destructive/90'

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className='sm:max-w-106.25'>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to {action} user <strong>{displayName}</strong> ({user?.username})?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              handleAction()
            }}
            disabled={isPending}
            className={buttonClass}
          >
            {isPending && (
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
            )}
            {buttonText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

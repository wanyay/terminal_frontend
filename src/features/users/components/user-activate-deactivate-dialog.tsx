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
  const { t } = useTranslation()
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
  const title = action === 'activate' ? t('users.activateUser' as never) : t('users.deactivateUser' as never)
  const actionLabel = action === 'activate' ? t('users.activate' as never) : t('users.deactivate' as never)
  const buttonText = actionLabel
  const buttonClass = action === 'activate' 
    ? 'bg-green-600 text-white hover:bg-green-700' 
    : 'bg-destructive text-destructive-foreground hover:bg-destructive/90'

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className='sm:max-w-106.25'>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('users.activateDeactivateConfirm' as never, { action: actionLabel, name: displayName, username: user?.username ?? '' })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>{t('common.cancel' as never)}</AlertDialogCancel>
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

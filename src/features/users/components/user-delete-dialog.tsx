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
import { useDeleteUser, type User } from '../api/queries'

interface UserDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: User | null
}

export function UserDeleteDialog({
  open,
  onOpenChange,
  user,
}: UserDeleteDialogProps) {
  const { t } = useTranslation()
  const { mutate: deleteUser, isPending } = useDeleteUser()

  function handleDelete() {
    if (!user) return
    deleteUser(user.id, {
      onSuccess: () => {
        onOpenChange(false)
      },
    })
  }

  const displayName =
    user?.fullName ||
    user?.username ||
    ''

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className='sm:max-w-[425px]'>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('users.deleteUser' as never)}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('users.deleteUserConfirm' as never, { name: displayName, username: user?.username ?? '' })}
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

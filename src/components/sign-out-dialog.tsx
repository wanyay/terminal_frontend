import { useNavigate, useLocation } from '@tanstack/react-router'
import { useTranslation } from '@/context/language-provider'
import { useLogout } from '@/features/auth/hooks/useLogout'
import { ConfirmDialog } from '@/components/confirm-dialog'

interface SignOutDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SignOutDialog({ open, onOpenChange }: SignOutDialogProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const { mutate: logout } = useLogout()

  const handleSignOut = () => {
    logout(undefined, {
      onSettled: () => {
        // Preserve current location for redirect after sign-in
        const currentPath = location.href
        navigate({
          to: '/sign-in',
          search: { redirect: currentPath },
          replace: true,
        })
      },
    })
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t('common.signOut' as never)}
      desc={t('common.signOutConfirm' as never)}
      confirmText={t('common.signOut' as never)}
      handleConfirm={handleSignOut}
      className='sm:max-w-sm'
    />
  )
}

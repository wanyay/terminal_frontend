import { useNavigate, useRouter } from '@tanstack/react-router'
import { useTranslation } from '@/context/language-provider'
import { Button } from '@/components/ui/button'

export function UnauthorisedError() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { history } = useRouter()
  return (
    <div className='h-svh'>
      <div className='m-auto flex h-full w-full flex-col items-center justify-center gap-2'>
        <h1 className='text-[7rem] leading-tight font-bold'>401</h1>
        <span className='font-medium'>{t('errors.unauthorizedTitle' as never)}</span>
        <p className='text-muted-foreground text-center'>
          {t('errors.unauthorizedDesc' as never)}
        </p>
        <div className='mt-6 flex gap-4'>
          <Button variant='outline' onClick={() => history.go(-1)}>
            {t('common.goBack' as never)}
          </Button>
          <Button onClick={() => navigate({ to: '/' })}>{t('common.backToHome' as never)}</Button>
        </div>
      </div>
    </div>
  )
}

import { useTranslation } from '@/context/language-provider'
import { LanguageSwitch } from '@/components/language-switch'

type AuthLayoutProps = {
  children: React.ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  const { t } = useTranslation()

  return (
    <div className='relative min-h-svh'>
      <div className='absolute end-4 top-4 z-10'>
        <LanguageSwitch />
      </div>
      <div className='container grid min-h-svh max-w-none items-center justify-center'>
        <div className='mx-auto flex w-full flex-col justify-center space-y-2 py-8 sm:w-[480px] sm:p-8'>
          <div className='mb-4 flex items-center justify-center'>
            {/* <Logo className='me-2' /> */}
            <h1 className='text-xl font-bold'>{t('app.name' as never)}</h1>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}

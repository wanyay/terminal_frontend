import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { LanguageSwitch } from '@/components/language-switch'
import { useTranslation } from '@/context/language-provider'
import { VisitingVehicleEntryPage } from './pages/vehicle-entry-page'

export function VisitingVehicleEntryRegistration() {
  const { t } = useTranslation()
  return (
    <>
      <Header>
        <div className='ms-auto flex items-center space-x-4'>
          <LanguageSwitch />
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-2 flex items-center justify-between space-y-2'>
          <h1 className='text-2xl font-bold tracking-tight'>
            {t('entry.vehicleRegistration' as never)}
          </h1>
        </div>
        <VisitingVehicleEntryPage />
      </Main>
    </>
  )
}

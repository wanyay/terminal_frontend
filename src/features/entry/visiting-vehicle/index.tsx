import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { VisitingVehicleEntryPage } from './pages/vehicle-entry-page'

export function VisitingVehicleEntryRegistration() {
  return (
    <>
      <Header>
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-2 flex items-center justify-between space-y-2'>
          <h1 className='text-2xl font-bold tracking-tight'>
            Visiting Vehicle Entry Registration
          </h1>
        </div>
        <VisitingVehicleEntryPage />
      </Main>
    </>
  )
}

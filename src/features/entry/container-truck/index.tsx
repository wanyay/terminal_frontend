import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { TrucksEntryPage } from './pages/trucks-entry-page'

export function ContainerTruckEntryRegistration() {
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
            Container Truck Entry Registration
          </h1>
        </div>
        <TrucksEntryPage></TrucksEntryPage>
      </Main>
    </>
  )
}

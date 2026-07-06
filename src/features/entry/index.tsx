import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { TrucksEntryPage } from './pages/trucks-entry-page'

export function EntryRegistration() {
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
            Entry Registration
          </h1>
        </div>
        <Tabs
          orientation='vertical'
          defaultValue='cont'
          className='space-y-4'
        >
          <div className='w-full overflow-x-auto pb-2'>
            <TabsList>
              <TabsTrigger value='container'>Container Truck</TabsTrigger>
              <TabsTrigger value='vehicle'>Visiting Vehicle</TabsTrigger>
              <TabsTrigger value='visitor'>Visitor</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value='container' className='space-y-4'>
            <TrucksEntryPage></TrucksEntryPage>
          </TabsContent>
          <TabsContent value='vehicle' className='space-y-4'></TabsContent>
          <TabsContent value='visitor' className='space-y-4'></TabsContent>
        </Tabs>
      </Main>
    </>
  )
}

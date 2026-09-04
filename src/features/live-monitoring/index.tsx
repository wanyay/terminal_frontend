import { Truck, Car, User } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { LanguageSwitch } from '@/components/language-switch'
import { useTranslation } from '@/context/language-provider'
import { useActiveTrucks } from '@/features/exit/container-truck/api/queries'
import { useActiveVehicles } from '@/features/exit/visiting-vehicle/api/queries'
import { useActiveVisitors } from '@/features/exit/visitor/api/queries'
import { ActiveTable } from './components/active-table'
import { truckColumns } from './components/truck-columns'
import { vehicleColumns } from './components/vehicle-columns'
import { visitorColumns } from './components/visitor-columns'
import { useLiveMonitoringState } from './hooks/use-live-monitoring-state'

export default function LiveMonitoring() {
  const { t } = useTranslation()
  const { activeTab, setActiveTab, trucks, vehicles, visitors } = useLiveMonitoringState()

  const trucksData = useActiveTrucks({ page: trucks.page, perPage: trucks.perPage, search: trucks.search || undefined, gateId: trucks.gateId })
  const vehiclesData = useActiveVehicles({ page: vehicles.page, perPage: vehicles.perPage, search: vehicles.search || undefined, gateId: vehicles.gateId })
  const visitorsData = useActiveVisitors({ page: visitors.page, perPage: visitors.perPage, search: visitors.search || undefined, gateId: visitors.gateId })

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
        <div className='space-y-4'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>{t('liveMonitoring.title' as never)}</h1>
            <p className='text-muted-foreground text-sm'>
              {t('liveMonitoring.subtitle' as never)}
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
            <TabsList>
              <TabsTrigger value='trucks'>
                <Truck className='mr-1.5 h-4 w-4' />
                {t('liveMonitoring.containerTrucks' as never)}
              </TabsTrigger>
              <TabsTrigger value='vehicles'>
                <Car className='mr-1.5 h-4 w-4' />
                {t('liveMonitoring.visitingVehicles' as never)}
              </TabsTrigger>
              <TabsTrigger value='visitors'>
                <User className='mr-1.5 h-4 w-4' />
                {t('liveMonitoring.visitors' as never)}
              </TabsTrigger>
            </TabsList>

            <TabsContent value='trucks' className='mt-4'>
              <ActiveTable
                columns={truckColumns(t)}
                data={trucksData.data?.data}
                meta={trucksData.data?.meta ?? { page: 1, perPage: 20, total: 0, totalPages: 0 }}
                isLoading={trucksData.isLoading}
                isError={trucksData.isError}
                page={trucks.page}
                perPage={trucks.perPage}
                search={trucks.search}
                gateId={trucks.gateId}
                searchPlaceholder={t('liveMonitoring.searchLicensePlate' as never)}
                emptyMessage={t('liveMonitoring.noActiveTrucks' as never)}
                errorMessage={t('liveMonitoring.failedLoadTrucks' as never)}
                onPageChange={trucks.setPage}
                onPerPageChange={trucks.setPerPage}
                onSearchChange={trucks.setSearch}
                onGateChange={trucks.setGateId}
              />
            </TabsContent>

            <TabsContent value='vehicles' className='mt-4'>
              <ActiveTable
                columns={vehicleColumns(t)}
                data={vehiclesData.data?.data}
                meta={vehiclesData.data?.meta ?? { page: 1, perPage: 20, total: 0, totalPages: 0 }}
                isLoading={vehiclesData.isLoading}
                isError={vehiclesData.isError}
                page={vehicles.page}
                perPage={vehicles.perPage}
                search={vehicles.search}
                gateId={vehicles.gateId}
                searchPlaceholder={t('liveMonitoring.searchPlateNumber' as never)}
                emptyMessage={t('liveMonitoring.noActiveVehicles' as never)}
                errorMessage={t('liveMonitoring.failedLoadVehicles' as never)}
                onPageChange={vehicles.setPage}
                onPerPageChange={vehicles.setPerPage}
                onSearchChange={vehicles.setSearch}
                onGateChange={vehicles.setGateId}
              />
            </TabsContent>

            <TabsContent value='visitors' className='mt-4'>
              <ActiveTable
                columns={visitorColumns(t)}
                data={visitorsData.data?.data}
                meta={visitorsData.data?.meta ?? { page: 1, perPage: 20, total: 0, totalPages: 0 }}
                isLoading={visitorsData.isLoading}
                isError={visitorsData.isError}
                page={visitors.page}
                perPage={visitors.perPage}
                search={visitors.search}
                gateId={visitors.gateId}
                searchPlaceholder={t('liveMonitoring.searchVisitorName' as never)}
                emptyMessage={t('liveMonitoring.noActiveVisitors' as never)}
                errorMessage={t('liveMonitoring.failedLoadVisitors' as never)}
                onPageChange={visitors.setPage}
                onPerPageChange={visitors.setPerPage}
                onSearchChange={visitors.setSearch}
                onGateChange={visitors.setGateId}
              />
            </TabsContent>
          </Tabs>
        </div>
      </Main>
    </>
  )
}

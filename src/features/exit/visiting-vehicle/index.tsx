import { useState } from 'react'
import { Outlet, useRouterState } from '@tanstack/react-router'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { LanguageSwitch } from '@/components/language-switch'
import { useTranslation } from '@/context/language-provider'
import { ActiveVehiclesTable } from './components/active-vehicles-table'

export function VisitingVehicleExitRegistration() {
  const { t } = useTranslation()
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(20)
  const [search, setSearch] = useState('')
  const [gateId, setGateId] = useState<string | undefined>(undefined)
  const isChildRoute = useRouterState({
    select: (s) =>
      s.matches.some(
        (m) =>
          m.routeId ===
          '/_authenticated/exit-registration/visiting-vehicle/$vehicleId'
      ),
  })

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
        {isChildRoute ? (
          <Outlet />
        ) : (
          <>
            <div className='mb-4 flex flex-wrap items-center justify-between gap-4'>
              <div>
                <h1 className='text-2xl font-bold tracking-tight'>
                  {t('exit.vehicleRegistration' as never)}
                </h1>
                <p className='text-muted-foreground text-sm'>
                  {t('exit.vehicleDesc' as never)}
                </p>
              </div>
            </div>

            <ActiveVehiclesTable
              page={page}
              perPage={perPage}
              search={search}
              gateId={gateId}
              onPageChange={setPage}
              onPerPageChange={setPerPage}
              onSearchChange={setSearch}
              onGateChange={setGateId}
            />
          </>
        )}
      </Main>
    </>
  )
}

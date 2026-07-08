import { useState } from 'react'
import { Outlet, useRouterState } from '@tanstack/react-router'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { ActiveVehiclesTable } from './components/active-vehicles-table'

export function VisitingVehicleExitRegistration() {
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
                  Visiting Vehicle Exit Registration
                </h1>
                <p className='text-muted-foreground text-sm'>
                  Register exit for active visiting vehicles inside the port
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

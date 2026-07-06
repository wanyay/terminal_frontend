import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { Button } from '@/components/ui/button'
import { VehiclesTable } from '../components/vehicles-table'
import { VehicleFormDialog } from '../components/vehicle-form-dialog'

export function VehiclesList() {
  const [formOpen, setFormOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(20)
  const [search, setSearch] = useState('')

  return (
    <>
      <Header>
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>
      <Main>
        <div className='mb-4 flex flex-wrap items-center justify-between gap-4'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>Visiting Vehicles</h1>
            <p className='text-muted-foreground text-sm'>Manage visiting vehicle entries and exits</p>
          </div>
          <Button onClick={() => setFormOpen(true)}>
            <Plus className='mr-2 h-4 w-4' />Register Entry
          </Button>
        </div>
        <VehiclesTable page={page} perPage={perPage} search={search} onPageChange={setPage} onPerPageChange={setPerPage} onSearchChange={setSearch} />
      </Main>
      <VehicleFormDialog open={formOpen} onOpenChange={setFormOpen} />
    </>
  )
}

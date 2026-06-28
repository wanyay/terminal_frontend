import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { Button } from '@/components/ui/button'
import { GatesTable } from '../components/gates-table'
import { GateFormDialog } from '../components/gate-form-dialog'

export function GatesList() {
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
            <h1 className='text-2xl font-bold tracking-tight'>Gates</h1>
            <p className='text-muted-foreground text-sm'>
              Manage entry and exit gates
            </p>
          </div>
          <Button onClick={() => setFormOpen(true)}>
            <Plus className='mr-2 h-4 w-4' />
            Add Gate
          </Button>
        </div>

        <GatesTable
          page={page}
          perPage={perPage}
          search={search}
          onPageChange={setPage}
          onPerPageChange={setPerPage}
          onSearchChange={setSearch}
        />
      </Main>

      <GateFormDialog open={formOpen} onOpenChange={setFormOpen} />
    </>
  )
}

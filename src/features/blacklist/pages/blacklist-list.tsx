import { useState } from 'react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { BlacklistFormDialog } from '../components/blacklist-form-dialog'
import { BlacklistTable } from '../components/blacklist-table'

export function BlacklistList() {
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
            <h1 className='text-2xl font-bold tracking-tight'>Blacklist</h1>
            <p className='text-muted-foreground text-sm'>
              Manage blocked license plates and NRC/passport numbers
            </p>
          </div>
        </div>

        <BlacklistTable
          page={page}
          perPage={perPage}
          search={search}
          onPageChange={setPage}
          onPerPageChange={setPerPage}
          onSearchChange={setSearch}
          onAddEntry={() => setFormOpen(true)}
        />
      </Main>

      <BlacklistFormDialog open={formOpen} onOpenChange={setFormOpen} />
    </>
  )
}

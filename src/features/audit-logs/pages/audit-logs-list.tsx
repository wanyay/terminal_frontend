import { useMemo, useState } from 'react'
import { subMonths, format } from 'date-fns'
import { type SortingState } from '@tanstack/react-table'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { LanguageSwitch } from '@/components/language-switch'
import { useTranslation } from '@/context/language-provider'
import { useAuditLogs } from '../api/queries'
import {
  AuditLogFilters,
  type AuditLogFiltersFormValues,
} from '../components/audit-log-filters'
import { AuditLogTable } from '../components/audit-log-table'

export function AuditLogsList() {
  const { t } = useTranslation()
  const today = useMemo(() => new Date(), [])
  const oneMonthAgo = useMemo(() => subMonths(new Date(), 1), [])

  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(20)
  const [filters, setFilters] = useState({
    search: '',
    startDate: format(oneMonthAgo, 'yyyy-MM-dd'),
    endDate: format(today, 'yyyy-MM-dd'),
    action: '',
    module: '',
  })
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'createdAt', desc: true },
  ])

  const sortBy = sorting[0]?.id ?? 'createdAt'
  const sortOrder = sorting[0]?.desc ? 'DESC' : 'ASC'

  const { data, isLoading, isError } = useAuditLogs({
    page,
    perPage,
    search: filters.search || undefined,
    sortBy,
    sortOrder,
    from: filters.startDate || undefined,
    to: filters.endDate || undefined,
    action: filters.action || undefined,
    module: filters.module || undefined,
  })

  const handleApplyFilters = (values: AuditLogFiltersFormValues) => {
    setPage(1)
    setFilters({
      search: values.search ?? '',
      startDate: values.startDate ? format(values.startDate, 'yyyy-MM-dd') : '',
      endDate: values.endDate ? format(values.endDate, 'yyyy-MM-dd') : '',
      action: values.action ?? '',
      module: values.module ?? '',
    })
  }

  const handleResetFilters = () => {
    setPage(1)
    setFilters({
      search: '',
      startDate: format(oneMonthAgo, 'yyyy-MM-dd'),
      endDate: format(today, 'yyyy-MM-dd'),
      action: '',
      module: '',
    })
    setSorting([{ id: 'createdAt', desc: true }])
  }

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
        <div className='mb-6 space-y-2'>
          <h1 className='text-2xl font-bold tracking-tight'>
            {t('auditLogs.title' as never)}
          </h1>
          <p className='text-muted-foreground text-sm'>
            {t('auditLogs.subtitle' as never)}
          </p>
        </div>

        <AuditLogFilters
          values={filters}
          onSubmit={handleApplyFilters}
          onReset={handleResetFilters}
        />

        <div className='mt-6'>
          <AuditLogTable
            data={data?.data ?? []}
            meta={
              data?.meta ?? { page: 1, perPage: 20, total: 0, totalPages: 0 }
            }
            isLoading={isLoading}
            isError={isError}
            sorting={sorting}
            onSortingChange={setSorting}
            page={page}
            perPage={perPage}
            onPageChange={setPage}
            onPerPageChange={(value) => {
              setPerPage(value)
              setPage(1)
            }}
          />
        </div>
      </Main>
    </>
  )
}

import { useMemo, useState } from 'react'
import { subMonths, format } from 'date-fns'
import { type SortingState } from '@tanstack/react-table'
import { toast } from 'sonner'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { handleServerError } from '@/lib/handle-server-error'
import { exportVisitorReports, useVisitorReports } from '../api/queries'
import { TruckReportFilters, type TruckReportFiltersFormValues } from '../components/truck-report-filters'
import { VisitorReportTable } from '../components/visitor-report-table'

export function VisitorReportPage() {
  const today = useMemo(() => new Date(), [])
  const oneMonthAgo = useMemo(() => subMonths(new Date(), 1), [])

  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(20)
  const [filters, setFilters] = useState({
    search: '',
    startDate: format(oneMonthAgo, 'yyyy-MM-dd'),
    endDate: format(today, 'yyyy-MM-dd'),
    entryGateId: '',
    exitGateId: '',
  })
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'createdAt', desc: true },
  ])
  const [isExporting, setIsExporting] = useState(false)

  const sortBy = sorting[0]?.id ?? 'createdAt'
  const sortOrder = sorting[0]?.desc ? 'DESC' : 'ASC'

  const { data, isLoading, isError } = useVisitorReports({
    page,
    perPage,
    search: filters.search || undefined,
    sortBy: sortBy === 'entryGate' || sortBy === 'exitGate' ? 'createdAt' : sortBy,
    sortOrder,
    startDate: filters.startDate || undefined,
    endDate: filters.endDate || undefined,
    entryGateId: filters.entryGateId || undefined,
    exitGateId: filters.exitGateId || undefined,
  })

  const handleApplyFilters = (values: TruckReportFiltersFormValues) => {
    setPage(1)
    setFilters({
      search: values.search ?? '',
      startDate: values.startDate ? format(values.startDate, 'yyyy-MM-dd') : '',
      endDate: values.endDate ? format(values.endDate, 'yyyy-MM-dd') : '',
      entryGateId: values.entryGateId ?? '',
      exitGateId: values.exitGateId ?? '',
    })
  }

  const handleResetFilters = () => {
    setPage(1)
    setFilters({
      search: '',
      startDate: format(oneMonthAgo, 'yyyy-MM-dd'),
      endDate: format(today, 'yyyy-MM-dd'),
      entryGateId: '',
      exitGateId: '',
    })
    setSorting([{ id: 'createdAt', desc: true }])
  }

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const result = await exportVisitorReports({
        search: filters.search || undefined,
        sortBy:
          sortBy === 'entryGate' || sortBy === 'exitGate' ? 'createdAt' : sortBy,
        sortOrder,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
        entryGateId: filters.entryGateId || undefined,
        exitGateId: filters.exitGateId || undefined,
      })

      if (!result.canceled) {
        toast.success('Report exported successfully')
      }
    } catch (error) {
      handleServerError(error)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <>
      <Header>
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-6 space-y-2'>
          <h1 className='text-2xl font-bold tracking-tight'>
            Visitor Report
          </h1>
          <p className='text-muted-foreground text-sm'>
            Review visitor movements with filters, sorting, and pagination.
          </p>
        </div>

        <TruckReportFilters
          values={filters}
          onSubmit={handleApplyFilters}
          onReset={handleResetFilters}
          onExport={handleExport}
          isExporting={isExporting}
        />

        <div className='mt-6'>
          <VisitorReportTable
            data={data?.data ?? []}
            meta={data?.meta ?? { page: 1, perPage: 20, total: 0, totalPages: 0 }}
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

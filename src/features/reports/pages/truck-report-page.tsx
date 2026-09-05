import { useMemo, useState } from 'react'
import { subMonths, format } from 'date-fns'
import { type SortingState } from '@tanstack/react-table'
import { toast } from 'sonner'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { LanguageSwitch } from '@/components/language-switch'
import { handleServerError } from '@/lib/handle-server-error'
import { useTranslation } from '@/context/language-provider'
import { getT } from '@/lib/i18n'
import { exportTruckReports, useTruckReports } from '../api/queries'
import { TruckReportFilters, type TruckReportFiltersFormValues } from '../components/truck-report-filters'
import { TruckReportTable } from '../components/truck-report-table'

export function TruckReportPage() {
  const { t } = useTranslation()
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

  const { data, isLoading, isError } = useTruckReports({
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
      const result = await exportTruckReports({
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
        toast.success(getT('reports.exportsSuccess' as never))
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
          <LanguageSwitch />
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-6 space-y-2'>
          <h1 className='text-2xl font-bold tracking-tight'>
            {t('reports.truckReport' as never)}
          </h1>
          <p className='text-muted-foreground text-sm'>
            {t('reports.truckReportDesc' as never)}
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
          <TruckReportTable
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

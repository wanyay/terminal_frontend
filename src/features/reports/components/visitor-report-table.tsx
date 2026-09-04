import { useMemo } from 'react'
import { format } from 'date-fns'
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table'
import { StatusBadge } from '@/components/status-badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DataTableColumnHeader } from '@/components/data-table/column-header'
import ServerSidePagination from '@/components/server-side-pagination'
import { useTranslation } from '@/context/language-provider'
import type { VisitorReport, ReportsMeta } from '../api/queries'

type Translator = ReturnType<typeof useTranslation>['t']

function buildColumns(t: Translator): ColumnDef<VisitorReport>[] {
  return [
  {
    accessorKey: 'visitorName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('reports.visitorName' as never)} />
    ),
    cell: ({ row }) => (
      <span className='font-medium'>{row.original.visitorName}</span>
    ),
  },
  {
    accessorKey: 'nrcOrPassport',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('reports.nrcOrPassport' as never)} />
    ),
    cell: ({ row }) => <span>{row.original.nrcOrPassport || '—'}</span>,
  },
  {
    accessorKey: 'phoneNumber',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('reports.phoneNumber' as never)} />
    ),
    cell: ({ row }) => <span>{row.original.phoneNumber || '—'}</span>,
  },
  {
    accessorKey: 'companyName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('reports.companyName' as never)} />
    ),
    cell: ({ row }) => <span>{row.original.companyName || '—'}</span>,
  },
  {
    accessorKey: 'purposeOfVisit',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('reports.purposeOfVisit' as never)} />
    ),
    cell: ({ row }) => <span>{row.original.purposeOfVisit || '—'}</span>,
  },
  {
    accessorKey: 'hostEmployee',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('reports.hostEmployee' as never)} />
    ),
    cell: ({ row }) => <span>{row.original.hostEmployee || '—'}</span>,
  },
  {
    id: 'entryGate',
    header: t('reports.entryGate' as never),
    cell: ({ row }) => <span>{row.original.entryGate?.name || '—'}</span>,
  },
  {
    id: 'exitGate',
    header: t('reports.exitGate' as never),
    cell: ({ row }) => <span>{row.original.exitGate?.name || '—'}</span>,
  },
  {
    accessorKey: 'entryTime',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('reports.entryTime' as never)} />
    ),
    cell: ({ row }) => (
      <span>
        {row.original.entryTime
          ? format(new Date(row.original.entryTime), 'dd/MM/yyyy h:mma')
          : '—'}
      </span>
    ),
  },
  {
    accessorKey: 'exitTime',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('reports.exitTime' as never)} />
    ),
    cell: ({ row }) => (
      <span>
        {row.original.exitTime
          ? format(new Date(row.original.exitTime), 'dd/MM/yyyy h:mma')
          : '—'}
      </span>
    ),
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('reports.status' as never)} />
    ),
    cell: ({ row }) => {
      const status = row.original.status
      return (
        <StatusBadge
          status={status}
          label={t(`statusBadges.${status.toLowerCase()}` as never)}
        />
      )
    },
  },
  {
    accessorKey: 'remarks',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('reports.remarks' as never)} />
    ),
    cell: ({ row }) => <span>{row.original.remarks || '—'}</span>,
  },
]
}

interface VisitorReportTableProps {
  data: VisitorReport[]
  meta: ReportsMeta
  isLoading: boolean
  isError: boolean
  sorting: SortingState
  onSortingChange: (sorting: SortingState) => void
  page: number
  perPage: number
  onPageChange: (page: number) => void
  onPerPageChange: (perPage: number) => void
}

export function VisitorReportTable({
  data,
  meta,
  isLoading,
  isError,
  sorting,
  onSortingChange,
  page,
  perPage,
  onPageChange,
  onPerPageChange,
}: VisitorReportTableProps) {
  const { t } = useTranslation()
  const columns = useMemo(() => buildColumns(t), [t])

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    manualSorting: true,
    onSortingChange: (updater) => {
      const next = typeof updater === 'function' ? updater(sorting) : updater
      onSortingChange(next)
    },
    getCoreRowModel: getCoreRowModel(),
  })

  if (isError) {
    return (
      <div className='flex items-center justify-center py-12'>
        <p className='text-destructive text-sm'>
          {t('reports.failedLoadVisitor' as never)}
        </p>
      </div>
    )
  }

  return (
    <div className='space-y-4'>
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  {columns.map((_, cellIndex) => (
                    <TableCell key={cellIndex}>
                      <Skeleton className='h-5 w-full' />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className='text-muted-foreground h-24 text-center'
                >
                  {t('reports.noVisitorRecords' as never)}
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <ServerSidePagination
        pagination={{
          currentPage: page,
          hasNextPage: page < meta.totalPages,
          hasPrevPage: page > 1,
          perPage,
          totalPages: meta.totalPages,
          totalRecords: meta.total,
        }}
        onPageChange={onPageChange}
        onPerPageChange={onPerPageChange}
      />
    </div>
  )
}

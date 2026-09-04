import { useState } from 'react'
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type PaginationState,
} from '@tanstack/react-table'
import { Pencil, Trash2, LogOut } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/status-badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { DataTablePagination } from '@/components/data-table/pagination'
import { useTranslation } from '@/context/language-provider'
import {
  useVisitors,
  useRegisterExit,
  useCancelVisitor,
  type Visitor,
} from '../api/queries'
import { VisitorFormDialog } from './visitor-form-dialog'
import { VisitorDeleteDialog } from './visitor-delete-dialog'

function getColumns(t: (key: never) => string): ColumnDef<Visitor>[] {
  return [
    {
      accessorKey: 'visitorName',
      header: t('visitors.name' as never),
      cell: ({ row }) => (
        <span className='font-medium'>{row.getValue('visitorName')}</span>
      ),
    },
    {
      accessorKey: 'nrcOrPassport',
      header: t('visitors.nrcOrPassport' as never),
      cell: ({ row }) => {
        const val = row.getValue('nrcOrPassport') as string | null
        return <span className='text-sm'>{val || '—'}</span>
      },
    },
    {
      accessorKey: 'companyName',
      header: t('visitors.company' as never),
      cell: ({ row }) => {
        const val = row.getValue('companyName') as string | null
        return <span className='text-sm'>{val || '—'}</span>
      },
    },
    {
      accessorKey: 'purposeOfVisit',
      header: t('visitors.purpose' as never),
      cell: ({ row }) => {
        const val = row.getValue('purposeOfVisit') as string | null
        return <span className='text-muted-foreground text-sm'>{val || '—'}</span>
      },
    },
    {
      accessorKey: 'entryTime',
      header: t('visitors.entryTime' as never),
      cell: ({ row }) => {
        const val = row.getValue('entryTime') as string | null
        return (
          <span className='text-sm'>
            {val
              ? new Date(val).toLocaleString('en-GB', {
                  day: '2-digit',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : '—'}
          </span>
        )
      },
    },
    {
      accessorKey: 'status',
      header: t('visitors.status' as never),
      cell: function StatusCell({ row }) {
        const status = row.getValue('status') as string
        return (
          <StatusBadge
            status={status}
            label={t(`statusBadges.${status.toLowerCase()}` as never)}
          />
        )
      },
    },
    {
      id: 'actions',
      header: t('common.actions' as never),
      cell: function ActionCell({ row }) {
        const visitor = row.original
        const { t: kt } = useTranslation()
        const [formOpen, setFormOpen] = useState(false)
        const [deleteOpen, setDeleteOpen] = useState(false)
        const { mutate: registerExit, isPending: isExiting } = useRegisterExit()
        const { mutate: cancelVisitor, isPending: isCancelling } = useCancelVisitor()

        const isActionPending = isExiting || isCancelling

        return (
          <>
            <div className='flex items-center gap-1'>
              <Button
                variant='ghost'
                size='icon'
                className='h-8 w-8'
                onClick={() => setFormOpen(true)}
                disabled={isActionPending}
              >
                <Pencil className='h-4 w-4' />
                <span className='sr-only'>{kt('visitors.editAccessible' as never, { name: visitor.visitorName })}</span>
              </Button>
              {visitor.status === 'ENTERED' && (
                <Button
                  variant='ghost'
                  size='icon'
                  className='h-8 w-8'
                  onClick={() =>
                    registerExit({
                      id: visitor.id,
                      exitGateId: visitor.entryGateId || '',
                    })
                  }
                  disabled={isActionPending}
                  title={kt('visitors.registerExit' as never)}
                >
                  <LogOut className='h-4 w-4 text-blue-600' />
                  <span className='sr-only'>{kt('visitors.registerExitFor' as never, { name: visitor.visitorName })}</span>
                </Button>
              )}
              <Button
                variant='ghost'
                size='icon'
                className='h-8 w-8 text-destructive hover:text-destructive'
                onClick={() =>
                  visitor.status === 'ENTERED'
                    ? cancelVisitor(visitor.id)
                    : setDeleteOpen(true)
                }
                disabled={isActionPending}
              >
                <Trash2 className='h-4 w-4' />
                <span className='sr-only'>
                  {visitor.status === 'ENTERED' ? kt('visitors.cancel' as never, { name: visitor.visitorName }) : kt('visitors.delete' as never, { name: visitor.visitorName })}
                </span>
              </Button>
            </div>

            <VisitorFormDialog
              open={formOpen}
              onOpenChange={setFormOpen}
              visitor={visitor}
            />

            <VisitorDeleteDialog
              open={deleteOpen}
              onOpenChange={setDeleteOpen}
              visitor={visitor}
            />
          </>
        )
      },
    },
  ]
}

interface VisitorsTableProps {
  page: number
  perPage: number
  search: string
  onPageChange: (page: number) => void
  onPerPageChange: (perPage: number) => void
  onSearchChange: (search: string) => void
}

export function VisitorsTable({
  page,
  perPage,
  search,
  onPageChange,
  onPerPageChange,
  onSearchChange,
}: VisitorsTableProps) {
  const { t } = useTranslation()
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const { data, isLoading, isError } = useVisitors({
    page,
    perPage,
    search: search || undefined,
  })

  const visitors = data?.data ?? []
  const meta = data?.meta ?? { page: 1, perPage: 20, total: 0, totalPages: 0 }

  const columns = getColumns(t as unknown as (key: never) => string)

  const pagination: PaginationState = {
    pageIndex: meta.page - 1,
    pageSize: meta.perPage,
  }

  const table = useReactTable({
    data: visitors,
    columns,
    pageCount: meta.totalPages,
    state: { pagination, columnFilters },
    manualPagination: true,
    onPaginationChange: (updater) => {
      const next = typeof updater === 'function' ? updater(pagination) : updater
      onPageChange(next.pageIndex + 1)
      if (next.pageSize !== perPage) onPerPageChange(next.pageSize)
    },
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  if (isError) {
    return (
      <div className='flex items-center justify-center py-12'>
        <p className='text-destructive text-sm'>{t('visitors.failedLoad' as never)}</p>
      </div>
    )
  }

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <Input
          placeholder={t('visitors.search' as never)}
          value={search}
          onChange={(e) => {
            onSearchChange(e.target.value)
            onPageChange(1)
          }}
          className='h-8 w-[250px]'
        />
      </div>
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {columns.map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className='h-5 w-full' />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : visitors.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className='h-24 text-center text-muted-foreground'>
                  {t('visitors.noVisitorsFound' as never)}
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
    </div>
  )
}

import { useEffect, useRef, useState } from 'react'
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type PaginationState,
} from '@tanstack/react-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { DataTablePagination } from '@/components/data-table/pagination'
import { DataTableFacetedFilter } from '@/components/data-table/faceted-filter'
import { useTranslation } from '@/context/language-provider'
import { useGates } from '@/features/gates/api/queries'

export interface ActiveTableProps<TData> {
  columns: ColumnDef<TData>[]
  data: TData[] | undefined
  meta: { page: number; perPage: number; total: number; totalPages: number }
  isLoading: boolean
  isError: boolean
  page: number
  perPage: number
  search: string
  gateId?: string
  searchPlaceholder: string
  emptyMessage: string
  errorMessage: string
  onPageChange: (page: number) => void
  onPerPageChange: (perPage: number) => void
  onSearchChange: (search: string) => void
  onGateChange: (gateId: string | undefined) => void
}

export function ActiveTable<TData>({
  columns,
  data,
  meta,
  isLoading,
  isError,
  page: _page,
  perPage,
  search,
  gateId,
  searchPlaceholder,
  emptyMessage,
  errorMessage,
  onPageChange,
  onPerPageChange,
  onSearchChange,
  onGateChange,
}: ActiveTableProps<TData>) {
  const { t } = useTranslation()
  const { data: gatesData } = useGates({ perPage: 100 })
  const allGates = gatesData?.data ?? []

  const gateOptions = allGates
    .filter((g) => g.type === 'ENTRY')
    .map((g) => ({ label: g.name, value: g.id }))

  const gateIdRef = useRef(gateId)
  gateIdRef.current = gateId
  const onGateChangeRef = useRef(onGateChange)
  onGateChangeRef.current = onGateChange

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const items = data ?? []

  const pagination: PaginationState = {
    pageIndex: meta.page - 1,
    pageSize: meta.perPage,
  }

  const table = useReactTable({
    data: items,
    columns,
    pageCount: meta.totalPages,
    initialState: { columnVisibility: { entryGateId: false } },
    state: { pagination, columnFilters },
    manualPagination: true,
    onPaginationChange: (updater) => {
      const next = typeof updater === 'function' ? updater(pagination) : updater
      onPageChange(next.pageIndex + 1)
      if (next.pageSize !== perPage) onPerPageChange(next.pageSize)
    },
    onColumnFiltersChange: (updater) => {
      setColumnFilters((prev) => {
        const next = typeof updater === 'function' ? updater(prev) : updater
        const idx = next.findIndex((f) => f.id === 'entryGateId')
        if (idx !== -1) {
          const values = next[idx].value as string[]
          if (values.length > 1) next[idx] = { ...next[idx], value: [values[values.length - 1]] }
          const newGateId = values.length > 1 ? values[values.length - 1] : values[0]
          if (newGateId !== gateIdRef.current) onGateChangeRef.current(newGateId)
        } else if (gateIdRef.current) {
          onGateChangeRef.current(undefined)
        }
        return next
      })
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  useEffect(() => {
    table.getColumn('entryGateId')?.setFilterValue(gateId ? [gateId] : undefined)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gateId])

  if (isError) {
    return (
      <div className='flex items-center justify-center py-12'>
        <p className='text-destructive text-sm'>{errorMessage}</p>
      </div>
    )
  }

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <Input
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => { onSearchChange(e.target.value); onPageChange(1) }}
            className='h-8 w-62.5'
          />
          {gateOptions.length > 0 && (
            <DataTableFacetedFilter
              column={table.getColumn('entryGateId')}
              title={t('liveMonitoring.gate' as never)}
              options={gateOptions}
            />
          )}
        </div>
      </div>

      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
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
                    <TableCell key={j}><Skeleton className='h-5 w-full' /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className='h-24 text-center text-muted-foreground'>
                  {emptyMessage}
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

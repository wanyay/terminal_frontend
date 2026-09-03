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
import { useNavigate } from '@tanstack/react-router'
import { LogOut } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { DataTablePagination } from '@/components/data-table/pagination'
import { DataTableFacetedFilter } from '@/components/data-table/faceted-filter'
import { useGates } from '@/features/gates/api/queries'
import { useActiveTrucks, type ActiveTruck } from '../api/queries'
import { format } from 'date-fns'

const columns: ColumnDef<ActiveTruck>[] = [
  {
    accessorKey: 'licensePlate',
    header: 'License Plate',
    cell: ({ row }) => (
      <span className='font-medium'>{row.getValue('licensePlate')}</span>
    ),
  },
  {
    accessorKey: 'entryGateId',
    header: 'Gate ID',
    enableHiding: true,
  },
  {
    accessorKey: 'driverName',
    header: 'Driver Name',
    cell: ({ row }) => {
      const val = row.getValue('driverName') as string | null
      return <span>{val || '—'}</span>
    },
  },
  {
    accessorKey: 'driverNrc',
    header: 'Driver NRC',
    cell: ({ row }) => {
      const val = row.getValue('driverNrc') as string | null
      return (
        <span className='text-muted-foreground text-sm'>
          {val || '—'}
        </span>
      )
    },
  },
  {
    id: 'entryGate',
    header: 'Entry Gate',
    cell: ({ row }) => {
      const gate = row.original.entryGate
      return gate ? (
        <Badge variant='outline' className='text-xs'>
          {gate.name}
        </Badge>
      ) : (
        <span className='text-muted-foreground text-sm'>—</span>
      )
    },
  },
  {
    accessorKey: 'entryTime',
    header: 'Entry Time',
    cell: ({ row }) => {
      const val = row.getValue('entryTime') as string
      return (
        <span className='text-sm'>
          {format(new Date(val), 'dd/MM/yyyy HH:mm')}
        </span>
      )
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string
      return (
        <Badge variant='outline' className='border-blue-500 text-blue-600 text-xs'>
          {status}
        </Badge>
      )
    },
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: function ActionCell({ row, table }) {
      const meta = table.options.meta as { onRegisterExit?: (truckId: string) => void } | undefined
      const onRegisterExit = meta?.onRegisterExit
      return (
        <Button
          variant='outline'
          size='sm'
          className='h-8'
          onClick={() => onRegisterExit?.(row.original.id)}
        >
          <LogOut className='mr-1 h-3.5 w-3.5' />
          Register Exit
        </Button>
      )
    },
  },
]

interface ActiveTrucksTableProps {
  page: number
  perPage: number
  search: string
  gateId?: string
  onPageChange: (page: number) => void
  onPerPageChange: (perPage: number) => void
  onSearchChange: (search: string) => void
  onGateChange: (gateId: string | undefined) => void
}

export function ActiveTrucksTable({
  page,
  perPage,
  search,
  gateId,
  onPageChange,
  onPerPageChange,
  onSearchChange,
  onGateChange,
}: ActiveTrucksTableProps) {
  const navigate = useNavigate()
  const { data: gatesData } = useGates({ perPage: 100 })
  const allGates = gatesData?.data ?? []

  const gateOptions = allGates
    .filter((g) => g.type === 'ENTRY')
    .map((g) => ({
      label: `${g.name}`,
      value: g.id,
    }))

  // Stable refs to avoid stale closures and effect dependency cycles
  const gateIdRef = useRef(gateId)
  gateIdRef.current = gateId
  const onGateChangeRef = useRef(onGateChange)
  onGateChangeRef.current = onGateChange

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const { data, isLoading, isError } = useActiveTrucks({
    page,
    perPage,
    search: search || undefined,
    gateId,
  })

  const trucks = data?.data ?? []
  const meta = data?.meta ?? { page: 1, perPage: 20, total: 0, totalPages: 0 }

  const pagination: PaginationState = {
    pageIndex: meta.page - 1,
    pageSize: meta.perPage,
  }

  const table = useReactTable({
    data: trucks,
    columns,
    pageCount: meta.totalPages,
    initialState: {
      columnVisibility: {
        entryGateId: false,
      },
    },
    state: {
      pagination,
      columnFilters,
    },
    manualPagination: true,
    onPaginationChange: (updater) => {
      const next = typeof updater === 'function' ? updater(pagination) : updater
      onPageChange(next.pageIndex + 1)
      if (next.pageSize !== perPage) {
        onPerPageChange(next.pageSize)
      }
    },
    onColumnFiltersChange: (updater) => {
      setColumnFilters((prev) => {
        const next = typeof updater === 'function' ? updater(prev) : updater
        // Enforce single selection for gate filter
        const gateFilterIndex = next.findIndex((f) => f.id === 'entryGateId')
        if (gateFilterIndex !== -1) {
          const values = next[gateFilterIndex].value as string[]
          if (values.length > 1) {
            next[gateFilterIndex] = {
              ...next[gateFilterIndex],
              value: [values[values.length - 1]],
            }
          }
          const newGateId = values.length > 1 ? values[values.length - 1] : values[0]
          if (newGateId !== gateIdRef.current) {
            onGateChangeRef.current(newGateId)
          }
        } else if (gateIdRef.current) {
          onGateChangeRef.current(undefined)
        }
        return next
      })
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    meta: {
      onRegisterExit: (truckId: string) => {
        navigate({
          to: '/exit-registration/container-truck/$truckId',
          params: { truckId },
        })
      },
    },
  })

  // Sync column filter when gateId changes externally (e.g. initial auto-filter)
  useEffect(() => {
    table.getColumn('entryGateId')?.setFilterValue(gateId ? [gateId] : undefined)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gateId])

  if (isError) {
    return (
      <div className='flex items-center justify-center py-12'>
        <p className='text-destructive text-sm'>
          Failed to load active trucks. Please try again.
        </p>
      </div>
    )
  }

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <Input
            placeholder='Search license plate...'
            value={search}
            onChange={(e) => {
              onSearchChange(e.target.value)
              onPageChange(1)
            }}
            className='h-8 w-62.5'
          />
          {gateOptions.length > 0 && (
            <DataTableFacetedFilter
              column={table.getColumn('entryGateId')}
              title='Gate'
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
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {columns.map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className='h-5 w-full' />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : trucks.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className='h-24 text-center text-muted-foreground'
                >
                  No active trucks found.
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

      <DataTablePagination table={table} />
    </div>
  )
}

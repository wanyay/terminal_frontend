import { useMemo } from 'react'
import { format } from 'date-fns'
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
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
import type { VehicleReport, ReportsMeta } from '../api/queries'

interface VehicleReportTableProps {
  data: VehicleReport[]
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

const columns: ColumnDef<VehicleReport>[] = [
  {
    accessorKey: 'plateNumber',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Plate Number' />
    ),
    cell: ({ row }) => (
      <span className='font-medium'>{row.original.plateNumber}</span>
    ),
  },
  {
    accessorKey: 'vehicleType',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Vehicle Type' />
    ),
    cell: ({ row }) => <span>{row.original.vehicleType || '—'}</span>,
  },
  {
    accessorKey: 'vehicleModel',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Vehicle Model' />
    ),
    cell: ({ row }) => <span>{row.original.vehicleModel || '—'}</span>,
  },
  {
    accessorKey: 'visitorName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Visitor Name' />
    ),
    cell: ({ row }) => <span>{row.original.visitorName}</span>,
  },
  {
    accessorKey: 'nrcOrLicense',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='NRC/Passport/Driver License' />
    ),
    cell: ({ row }) => <span>{row.original.nrcOrLicense || '—'}</span>,
  },
  {
    accessorKey: 'companyName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Company Name' />
    ),
    cell: ({ row }) => <span>{row.original.companyName || '—'}</span>,
  },
  {
    accessorKey: 'purposeOfVisit',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Purpose of Visit' />
    ),
    cell: ({ row }) => <span>{row.original.purposeOfVisit || '—'}</span>,
  },
  {
    id: 'entryGate',
    header: 'Entry Gate',
    cell: ({ row }) => <span>{row.original.entryGate?.name || '—'}</span>,
  },
  {
    id: 'exitGate',
    header: 'Exit Gate',
    cell: ({ row }) => <span>{row.original.exitGate?.name || '—'}</span>,
  },
  {
    accessorKey: 'entryTime',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Entry Time' />
    ),
    cell: ({ row }) => (
      <span>
        {row.original.entryTime
          ? format(new Date(row.original.entryTime), 'dd/MM/yyyy HH:mm')
          : '—'}
      </span>
    ),
  },
  {
    accessorKey: 'exitTime',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Exit Time' />
    ),
    cell: ({ row }) => (
      <span>
        {row.original.exitTime
          ? format(new Date(row.original.exitTime), 'dd/MM/yyyy HH:mm')
          : '—'}
      </span>
    ),
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    cell: ({ row }) => {
      const status = row.original.status
      const variant =
        status === 'EXITED'
          ? 'secondary'
          : status === 'CANCELLED'
          ? 'destructive'
          : 'default'
      return <Badge variant={variant}>{status}</Badge>
    },
  },
  {
    accessorKey: 'remarks',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Remarks' />
    ),
    cell: ({ row }) => <span>{row.original.remarks || '—'}</span>,
  },
]

export function VehicleReportTable({
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
}: VehicleReportTableProps) {
  const columnDefs = useMemo(() => columns, [])

  const table = useReactTable({
    data,
    columns: columnDefs,
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
          Failed to load vehicle report data. Please try again.
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
                  {columnDefs.map((_, cellIndex) => (
                    <TableCell key={cellIndex}>
                      <Skeleton className='h-5 w-full' />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columnDefs.length}
                  className='text-muted-foreground h-24 text-center'
                >
                  No vehicle records found.
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

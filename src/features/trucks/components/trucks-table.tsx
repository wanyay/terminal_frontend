import { useState } from 'react'
import { flexRender, getCoreRowModel, getFilteredRowModel, useReactTable, type ColumnDef, type ColumnFiltersState, type PaginationState } from '@tanstack/react-table'
import { Pencil, Trash2, LogOut } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { DataTablePagination } from '@/components/data-table/pagination'
import { useCancelTruck, useRegisterTruckExit, useTrucks, type Truck } from '../api/queries'
import { TruckFormDialog } from './truck-form-dialog'

const statusVariant: Record<string, 'default' | 'secondary' | 'destructive'> = {
  ENTERED: 'default',
  EXITED: 'secondary',
  CANCELLED: 'destructive',
}

const columns: ColumnDef<Truck>[] = [
  { accessorKey: 'licensePlate', header: 'Plate', cell: ({ row }) => <span className='font-mono font-medium'>{row.getValue('licensePlate')}</span> },
  { accessorKey: 'containerNumber', header: 'Container', cell: ({ row }) => <span>{row.getValue('containerNumber') || '—'}</span> },
  { accessorKey: 'driverName', header: 'Driver', cell: ({ row }) => <span>{row.getValue('driverName') || '—'}</span> },
  { accessorKey: 'entryTime', header: 'Entry Time', cell: ({ row }) => <span>{row.getValue('entryTime') ? new Date(row.getValue('entryTime') as string).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'}</span> },
  { accessorKey: 'status', header: 'Status', cell: ({ row }) => <Badge variant={statusVariant[row.getValue('status') as string] || 'secondary'}>{String(row.getValue('status'))}</Badge> },
  {
    id: 'actions',
    header: 'Actions',
    cell: function ActionCell({ row }) {
      const truck = row.original
      const [formOpen, setFormOpen] = useState(false)
      const { mutate: doExit, isPending: exiting } = useRegisterTruckExit()
      const { mutate: doCancel, isPending: cancelling } = useCancelTruck()
      const pending = exiting || cancelling

      return (
        <>
          <div className='flex items-center gap-1'>
            <Button variant='ghost' size='icon' className='h-8 w-8' onClick={() => setFormOpen(true)} disabled={pending}><Pencil className='h-4 w-4' /></Button>
            {truck.status === 'ENTERED' && (
              <Button variant='ghost' size='icon' className='h-8 w-8' onClick={() => doExit({ id: truck.id, exitGateId: truck.entryGateId || '' })} disabled={pending} title='Exit'><LogOut className='h-4 w-4 text-blue-600' /></Button>
            )}
            <Button variant='ghost' size='icon' className='h-8 w-8 text-destructive' onClick={() => truck.status === 'ENTERED' ? doCancel(truck.id) : undefined} disabled={pending}><Trash2 className='h-4 w-4' /></Button>
          </div>
          <TruckFormDialog open={formOpen} onOpenChange={setFormOpen} truck={truck} />
        </>
      )
    },
  },
]

interface Props {
  page: number
  perPage: number
  search: string
  onPageChange: (page: number) => void
  onPerPageChange: (perPage: number) => void
  onSearchChange: (search: string) => void
}

export function TrucksTable({ page, perPage, search, onPageChange, onPerPageChange, onSearchChange }: Props) {
  const [colFilters, setColFilters] = useState<ColumnFiltersState>([])
  const { data, isLoading, isError } = useTrucks({ page, perPage, search: search || undefined })
  const trucks = data?.data ?? []
  const meta = data?.meta ?? { page: 1, perPage: 20, total: 0, totalPages: 0 }

  const pagination: PaginationState = { pageIndex: meta.page - 1, pageSize: meta.perPage }
  const table = useReactTable({
    data: trucks,
    columns,
    pageCount: meta.totalPages,
    state: { pagination, columnFilters: colFilters },
    manualPagination: true,
    onPaginationChange: (up) => {
      const n = typeof up === 'function' ? up(pagination) : up
      onPageChange(n.pageIndex + 1)
      if (n.pageSize !== perPage) onPerPageChange(n.pageSize)
    },
    onColumnFiltersChange: setColFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  if (isError) return <div className='flex items-center justify-center py-12'><p className='text-destructive text-sm'>Failed to load container trucks.</p></div>

  return (
    <div className='space-y-4'>
      <Input placeholder='Search trucks...' value={search} onChange={(e) => { onSearchChange(e.target.value); onPageChange(1) }} className='h-8 w-62.5' />
      <div className='rounded-md border'>
        <Table>
          <TableHeader>{table.getHeaderGroups().map((hg) => <TableRow key={hg.id}>{hg.headers.map((h) => <TableHead key={h.id}>{h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}</TableHead>)}</TableRow>)}</TableHeader>
          <TableBody>
            {isLoading ? Array.from({ length: 5 }).map((_, i) => <TableRow key={i}>{columns.map((_, j) => <TableCell key={j}><Skeleton className='h-5 w-full' /></TableCell>)}</TableRow>)
              : trucks.length === 0 ? <TableRow><TableCell colSpan={columns.length} className='h-24 text-center text-muted-foreground'>No container trucks found.</TableCell></TableRow>
              : table.getRowModel().rows.map((row) => <TableRow key={row.id}>{row.getVisibleCells().map((cell) => <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>)}</TableRow>)}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
    </div>
  )
}

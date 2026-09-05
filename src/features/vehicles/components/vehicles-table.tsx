import { useState } from 'react'
import {
  flexRender, getCoreRowModel, getFilteredRowModel, useReactTable,
  type ColumnDef, type ColumnFiltersState, type PaginationState,
} from '@tanstack/react-table'
import { Pencil, Trash2, LogOut } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/status-badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { DataTablePagination } from '@/components/data-table/pagination'
import { useTranslation } from '@/context/language-provider'
import { useVehicles, useRegisterVehicleExit, useCancelVehicle, type Vehicle } from '../api/queries'
import { VehicleFormDialog } from './vehicle-form-dialog'
import { VehicleDeleteDialog } from './vehicle-delete-dialog'

function getColumns(t: (key: never) => string): ColumnDef<Vehicle>[] {
  return [
    { accessorKey: 'plateNumber', header: t('vehicles.plate' as never), cell: ({ row }) => <span className='font-mono font-medium'>{row.getValue('plateNumber')}</span> },
    { accessorKey: 'visitorName', header: t('vehicles.visitor' as never), cell: ({ row }) => <span>{row.getValue('visitorName')}</span> },
    {
      accessorKey: 'vehicleType', header: t('vehicles.type' as never), cell: ({ row }) => {
        const v = row.getValue('vehicleType') as string | null
        return <span className='text-sm'>{v || '—'}</span>
      },
    },
    {
      accessorKey: 'companyName', header: t('vehicles.company' as never), cell: ({ row }) => {
        const v = row.getValue('companyName') as string | null
        return <span className='text-sm'>{v || '—'}</span>
      },
    },
    {
      accessorKey: 'purposeOfVisit', header: t('vehicles.purpose' as never), cell: ({ row }) => {
        const v = row.getValue('purposeOfVisit') as string | null
        return <span className='text-muted-foreground text-sm'>{v || '—'}</span>
      },
    },
    {
      accessorKey: 'entryTime', header: t('vehicles.entryTime' as never), cell: ({ row }) => {
        const v = row.getValue('entryTime') as string | null
        return <span className='text-sm'>{v ? new Date(v).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'}</span>
      },
    },
    {
      accessorKey: 'status', header: t('vehicles.status' as never), cell: function StatusCell({ row }) {
        const s = row.getValue('status') as string
        return <StatusBadge status={s} label={t(`statusBadges.${s.toLowerCase()}` as never)} />
      },
    },
    {
      id: 'actions', header: t('common.actions' as never), cell: function ActionCell({ row }) {
        const v = row.original
        const [formOpen, setFormOpen] = useState(false)
        const [delOpen, setDelOpen] = useState(false)
        const { mutate: doExit, isPending: ex } = useRegisterVehicleExit()
        const { mutate: doCancel, isPending: ca } = useCancelVehicle()
        const actionPending = ex || ca
        return (
          <>
            <div className='flex items-center gap-1'>
              <Button variant='ghost' size='icon' className='h-8 w-8' onClick={() => setFormOpen(true)} disabled={actionPending}><Pencil className='h-4 w-4' /></Button>
              {v.status === 'ENTERED' && (
                <Button variant='ghost' size='icon' className='h-8 w-8' onClick={() => doExit({ id: v.id, exitGateId: v.entryGateId || '' })} disabled={actionPending} title={t('common.exit' as never)}><LogOut className='h-4 w-4 text-blue-600' /></Button>
              )}
              <Button variant='ghost' size='icon' className='h-8 w-8 text-destructive' onClick={() => v.status === 'ENTERED' ? doCancel(v.id) : setDelOpen(true)} disabled={actionPending}><Trash2 className='h-4 w-4' /></Button>
            </div>
            <VehicleFormDialog open={formOpen} onOpenChange={setFormOpen} vehicle={v} />
            <VehicleDeleteDialog open={delOpen} onOpenChange={setDelOpen} vehicle={v} />
          </>
        )
      },
    },
  ]
}

interface Props { page: number; perPage: number; search: string; onPageChange: (p: number) => void; onPerPageChange: (p: number) => void; onSearchChange: (s: string) => void }

export function VehiclesTable({ page, perPage, search, onPageChange, onPerPageChange, onSearchChange }: Props) {
  const { t } = useTranslation()
  const [colFilters, setColFilters] = useState<ColumnFiltersState>([])
  const { data, isLoading, isError } = useVehicles({ page, perPage, search: search || undefined })
  const vehicles = data?.data ?? []
  const meta = data?.meta ?? { page: 1, perPage: 20, total: 0, totalPages: 0 }

  const columns = getColumns(t as unknown as (key: never) => string)
  const pagination: PaginationState = { pageIndex: meta.page - 1, pageSize: meta.perPage }
  const table = useReactTable({
    data: vehicles, columns, pageCount: meta.totalPages,
    state: { pagination, columnFilters: colFilters },
    manualPagination: true,
    onPaginationChange: (up) => { const n = typeof up === 'function' ? up(pagination) : up; onPageChange(n.pageIndex + 1); if (n.pageSize !== perPage) onPerPageChange(n.pageSize) },
    onColumnFiltersChange: setColFilters,
    getCoreRowModel: getCoreRowModel(), getFilteredRowModel: getFilteredRowModel(),
  })

  if (isError) return <div className='flex items-center justify-center py-12'><p className='text-destructive text-sm'>{t('vehicles.failedLoad' as never)}</p></div>

  return (
    <div className='space-y-4'>
      <Input placeholder={t('vehicles.search' as never)} value={search} onChange={(e) => { onSearchChange(e.target.value); onPageChange(1) }} className='h-8 w-[250px]' />
      <div className='rounded-md border'>
        <Table>
          <TableHeader>{table.getHeaderGroups().map(hg => (<TableRow key={hg.id}>{hg.headers.map(h => (<TableHead key={h.id}>{h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}</TableHead>))}</TableRow>))}</TableHeader>
          <TableBody>
            {isLoading ? Array.from({ length: 5 }).map((_, i) => (<TableRow key={i}>{columns.map((_, j) => (<TableCell key={j}><Skeleton className='h-5 w-full' /></TableCell>))}</TableRow>))
            : vehicles.length === 0 ? (<TableRow><TableCell colSpan={columns.length} className='h-24 text-center text-muted-foreground'>{t('vehicles.noVehiclesFound' as never)}</TableCell></TableRow>)
            : table.getRowModel().rows.map(r => (<TableRow key={r.id}>{r.getVisibleCells().map(c => (<TableCell key={c.id}>{flexRender(c.column.columnDef.cell, c.getContext())}</TableCell>))}</TableRow>))}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
    </div>
  )
}

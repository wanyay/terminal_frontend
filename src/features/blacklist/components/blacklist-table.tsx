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
import { Pencil, Trash2, Plus } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DataTablePagination } from '@/components/data-table/pagination'
import { useAuthStore } from '@/features/auth/stores/auth-store'
import { useBlacklist, type BlacklistEntry } from '../api/queries'
import { BlacklistDeleteDialog } from './blacklist-delete-dialog'
import { BlacklistFormDialog } from './blacklist-form-dialog'

const columns: ColumnDef<BlacklistEntry>[] = [
  {
    accessorKey: 'type',
    header: 'Type',
    cell: ({ row }) => {
      const type = row.getValue('type') as string
      return (
        <Badge variant={type === 'license_plate' ? 'default' : 'secondary'}>
          {type === 'license_plate' ? 'License Plate' : 'NRC/Passport'}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'value',
    header: 'Value',
    cell: ({ row }) => (
      <span className='font-medium'>{row.getValue('value')}</span>
    ),
  },
  {
    accessorKey: 'reason',
    header: 'Reason',
    cell: ({ row }) => {
      const reason = row.getValue('reason') as string | null
      return (
        <span className='text-muted-foreground text-sm'>{reason || '—'}</span>
      )
    },
  },
  {
    accessorKey: 'isActive',
    header: 'Status',
    cell: ({ row }) => {
      const active = row.getValue('isActive') as boolean
      return (
        <Badge
          variant={active ? 'outline' : 'secondary'}
          className={active ? 'border-green-500 text-green-600' : ''}
        >
          {active ? 'Active' : 'Inactive'}
        </Badge>
      )
    },
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: function ActionCell({ row }) {
      const entry = row.original
      const { auth } = useAuthStore()
      const canDelete = auth.roleNames.includes('SUPER_ADMIN')
      const [formOpen, setFormOpen] = useState(false)
      const [deleteOpen, setDeleteOpen] = useState(false)

      return (
        <>
          <div className='flex items-center gap-1'>
            <Button
              variant='ghost'
              size='icon'
              className='h-8 w-8'
              onClick={() => setFormOpen(true)}
            >
              <Pencil className='h-4 w-4' />
              <span className='sr-only'>Edit {entry.value}</span>
            </Button>
            {canDelete && (
              <Button
                variant='ghost'
                size='icon'
                className='text-destructive hover:text-destructive h-8 w-8'
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 className='h-4 w-4' />
                <span className='sr-only'>Delete {entry.value}</span>
              </Button>
            )}
          </div>

          <BlacklistFormDialog
            open={formOpen}
            onOpenChange={setFormOpen}
            entry={entry}
          />

          {canDelete && (
            <BlacklistDeleteDialog
              open={deleteOpen}
              onOpenChange={setDeleteOpen}
              entry={entry}
            />
          )}
        </>
      )
    },
  },
]

interface BlacklistTableProps {
  page: number
  perPage: number
  search: string
  onPageChange: (page: number) => void
  onPerPageChange: (perPage: number) => void
  onSearchChange: (search: string) => void
  onAddEntry: () => void
}

export function BlacklistTable({
  page,
  perPage,
  search,
  onPageChange,
  onPerPageChange,
  onSearchChange,
  onAddEntry,
}: BlacklistTableProps) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const { data, isLoading, isError } = useBlacklist({
    page,
    perPage,
    search: search || undefined,
  })

  const entries = data?.data ?? []
  const meta = data?.meta ?? { page: 1, perPage: 20, total: 0, totalPages: 0 }

  const pagination: PaginationState = {
    pageIndex: meta.page - 1,
    pageSize: meta.perPage,
  }

  const table = useReactTable({
    data: entries,
    columns,
    pageCount: meta.totalPages,
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
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  if (isError) {
    return (
      <div className='flex items-center justify-center py-12'>
        <p className='text-destructive text-sm'>
          Failed to load blocklist. Please try again.
        </p>
      </div>
    )
  }

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <Input
          placeholder='Search blocklist...'
          value={search}
          onChange={(e) => {
            onSearchChange(e.target.value)
            onPageChange(1)
          }}
          className='h-8 w-62.5'
        />
        <Button onClick={onAddEntry}>
          <Plus className='mr-2 h-4 w-4' />
          Add Entry
        </Button>
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
            ) : entries.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className='text-muted-foreground h-24 text-center'
                >
                  No blocklist entries found.
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

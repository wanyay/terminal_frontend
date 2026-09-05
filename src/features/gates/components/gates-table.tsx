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
import { Pencil, Trash2 } from 'lucide-react'
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
import { useTranslation } from '@/context/language-provider'
import type { TranslationKey } from '@/lib/i18n'
import { useGates, type Gate } from '../api/queries'
import { GateFormDialog } from './gate-form-dialog'
import { GateDeleteDialog } from './gate-delete-dialog'

type ColumnType = ColumnDef<Gate>[]

function buildColumns(t: (key: TranslationKey, params?: Record<string, string | number>) => string): ColumnType {
  return [
  {
    accessorKey: 'code',
    header: t('gates.code' as never),
    cell: ({ row }) => (
      <span className='font-medium'>{row.getValue('code')}</span>
    ),
  },
  {
    accessorKey: 'code',
    header: 'Code',
    cell: ({ row }) => (
      <span className='font-medium'>{row.getValue('code')}</span>
    ),
  },
  {
    accessorKey: 'name',
    header: t('gates.name' as never),
    cell: ({ row }) => <span>{row.getValue('name')}</span>,
  },
  {
    accessorKey: 'type',
    header: t('gates.type' as never),
    cell: ({ row }) => {
      const type = row.getValue('type') as string
      return (
        <Badge variant={type === 'ENTRY' ? 'default' : 'secondary'}>
          {type === 'ENTRY' ? t('gates.entry' as never) : t('gates.exit' as never)}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'description',
    header: t('gates.description' as never),
    cell: ({ row }) => {
      const desc = row.getValue('description') as string | null
      return (
        <span className='text-muted-foreground text-sm'>
          {desc || '—'}
        </span>
      )
    },
  },
  {
    accessorKey: 'isActive',
    header: t('common.status' as never),
    cell: ({ row }) => {
      const active = row.getValue('isActive') as boolean
      return (
        <Badge variant={active ? 'outline' : 'secondary'} className={active ? 'border-green-500 text-green-600' : ''}>
          {active ? t('common.active' as never) : t('common.inactive' as never)}
        </Badge>
      )
    },
  },
  {
    id: 'actions',
    header: t('common.actions' as never),
    cell: function ActionCell({ row }) {
      const gate = row.original
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
              <span className='sr-only'>{t('gates.editAccessible' as never, { name: gate.name })}</span>
            </Button>
            <Button
              variant='ghost'
              size='icon'
              className='h-8 w-8 text-destructive hover:text-destructive'
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 className='h-4 w-4' />
              <span className='sr-only'>{t('gates.deleteAccessible' as never, { name: gate.name })}</span>
            </Button>
          </div>

          <GateFormDialog
            open={formOpen}
            onOpenChange={setFormOpen}
            gate={gate}
          />

          <GateDeleteDialog
            open={deleteOpen}
            onOpenChange={setDeleteOpen}
            gate={gate}
          />
        </>
      )
    },
  },
]
}

interface GatesTableProps {
  page: number
  perPage: number
  search: string
  onPageChange: (page: number) => void
  onPerPageChange: (perPage: number) => void
  onSearchChange: (search: string) => void
}

export function GatesTable({
  page,
  perPage,
  search,
  onPageChange,
  onPerPageChange,
  onSearchChange,
}: GatesTableProps) {
  const { t } = useTranslation()
  const columns = buildColumns(t)
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const { data, isLoading, isError } = useGates({
    page,
    perPage,
    search: search || undefined,
  })

  const gates = data?.data ?? []
  const meta = data?.meta ?? { page: 1, perPage: 20, total: 0, totalPages: 0 }

  const pagination: PaginationState = {
    pageIndex: meta.page - 1,
    pageSize: meta.perPage,
  }

  const table = useReactTable({
    data: gates,
    columns,
    getRowId: (row) => row.id,
    pageCount: meta.totalPages,
    state: {
      pagination,
      columnFilters,
    },
    manualPagination: true,
    onPaginationChange: (updater) => {
      const next =
        typeof updater === 'function'
          ? updater(pagination)
          : updater
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
          {t('gates.failedLoad' as never)}
        </p>
      </div>
    )
  }

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <Input
          placeholder={t('gates.search' as never)}
          value={search}
          onChange={(e) => {
            onSearchChange(e.target.value)
            onPageChange(1)
          }}
          className='h-8 w-62.5'
        />
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
                        header.getContext(),
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
            ) : gates.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className='h-24 text-center text-muted-foreground'
                >
                  {t('gates.noGatesFound' as never)}
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
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

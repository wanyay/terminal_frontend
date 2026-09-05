import { useMemo, useState } from 'react'
import { format } from 'date-fns'
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table'
import { Eye } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
import type { AuditLog, AuditLogsMeta } from '../api/queries'
import { parseUserAgent } from '../lib/user-agent'
import { AuditLogDetailDialog } from './audit-log-detail-dialog'

type Translator = ReturnType<typeof useTranslation>['t']

function ActionBadge({ action }: { action: string }) {
  const variant =
    action === 'DELETE'
      ? 'destructive'
      : action === 'CREATE'
        ? 'default'
        : action === 'UPDATE'
          ? 'secondary'
          : 'outline'

  return <Badge variant={variant}>{action}</Badge>
}

function buildColumns(t: Translator): ColumnDef<AuditLog>[] {
  return [
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('auditLogs.timestamp' as never)} />
    ),
    cell: ({ row }) => (
      <span className='whitespace-nowrap'>
        {format(new Date(row.original.createdAt), 'dd/MM/yyyy h:mma')}
      </span>
    ),
  },
  {
    accessorKey: 'username',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('auditLogs.user' as never)} />
    ),
    cell: ({ row }) => (
      <span className='font-medium'>{row.original.username}</span>
    ),
  },
  {
    accessorKey: 'action',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('auditLogs.action' as never)} />
    ),
    cell: ({ row }) => <ActionBadge action={row.original.action} />,
  },
  {
    accessorKey: 'module',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('auditLogs.module' as never)} />
    ),
    cell: ({ row }) => <span>{row.original.module}</span>,
  },
  {
    accessorKey: 'ipAddress',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('auditLogs.ipAddress' as never)} />
    ),
    cell: ({ row }) => (
      <span className='text-muted-foreground text-sm'>
        {row.original.ipAddress || '—'}
      </span>
    ),
  },
  {
    accessorKey: 'userAgent',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('auditLogs.userAgent' as never)} />
    ),
    cell: ({ row }) => {
      const parsed = parseUserAgent(row.original.userAgent)
      return (
        <span
          className='text-muted-foreground block max-h-8 overflow-hidden text-sm text-ellipsis'
          title={row.original.userAgent || undefined}
        >
          {row.original.userAgent
            ? `${parsed.browser} · ${parsed.os} · ${parsed.device}`
            : '—'}
        </span>
      )
    },
  },
  {
    id: 'details',
    header: t('auditLogs.details' as never),
    cell: function DetailsCell({ row }) {
      const log = row.original
      const [detailOpen, setDetailOpen] = useState(false)

      return (
        <>
          <Button
            variant='ghost'
            size='icon'
            className='h-8 w-8'
            onClick={() => setDetailOpen(true)}
          >
            <Eye className='h-4 w-4' />
            <span className='sr-only'>{t('common.viewDetails' as never)}</span>
          </Button>
          <AuditLogDetailDialog
            open={detailOpen}
            onOpenChange={setDetailOpen}
            log={log}
          />
        </>
      )
    },
  },
]
}

interface AuditLogTableProps {
  data: AuditLog[]
  meta: AuditLogsMeta
  isLoading: boolean
  isError: boolean
  sorting: SortingState
  onSortingChange: (sorting: SortingState) => void
  page: number
  perPage: number
  onPageChange: (page: number) => void
  onPerPageChange: (perPage: number) => void
}

export function AuditLogTable({
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
}: AuditLogTableProps) {
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
          {t('auditLogs.failedLoad' as never)}
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
                  {t('auditLogs.noLogs' as never)}
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

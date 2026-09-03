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
import { KeyRound, Pencil, Trash2, UserCheck, UserX } from 'lucide-react'
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
import { useUsers, type User } from '../api/queries'
import { UserFormDialog } from './user-form-dialog'
import { UserDeleteDialog } from './user-delete-dialog'
import { UserChangePasswordDialog } from './user-change-password-dialog'
import { UserActivateDeactivateDialog } from './user-activate-deactivate-dialog'

const columns: ColumnDef<User>[] = [
  {
    accessorKey: 'username',
    header: 'Username',
    cell: ({ row }) => (
      <span className='font-medium'>{row.getValue('username')}</span>
    ),
  },
  {
    accessorKey: 'fullName',
    header: 'Name',
    cell: ({ row }) => <span>{row.getValue('fullName')}</span>,
  },
  {
    accessorKey: 'email',
    header: 'Email',
    cell: ({ row }) => (
      <span className='text-muted-foreground text-sm'>
        {row.getValue('email')}
      </span>
    ),
  },
  {
    id: 'roles',
    header: 'Roles',
    cell: ({ row }) => {
      const roles = row.original.roles
      return (
        <div className='flex flex-wrap gap-1'>
          {roles.map((role) => (
            <Badge key={role.id} variant='outline' className='text-xs'>
              {role.name}
            </Badge>
          ))}
          {roles.length === 0 && (
            <span className='text-muted-foreground text-sm'>—</span>
          )}
        </div>
      )
    },
  },
  {
    id: 'gates',
    header: 'Gates',
    cell: ({ row }) => {
      const user = row.original
      const isSecurityOfficer = user.roles.some((r) => r.name === 'SECURITY_OFFICER')

      if (isSecurityOfficer) {
        // Show assigned gate for Security Officers
        return (
          <span className='text-sm'>
            {user.assignedGate ? (
              <Badge variant='outline' className='text-xs'>
                {user.assignedGate.name}
              </Badge>
            ) : (
              <span className='text-muted-foreground text-sm'>—</span>
            )}
          </span>
        )
      } else {
        // Show manageable gates for Admin/Supervisor
        return (
          <div className='flex flex-wrap gap-1'>
            {user.manageableGates && user.manageableGates.length > 0 ? (
              user.manageableGates.map((gate) => (
                <Badge key={gate.id} variant='outline' className='text-xs'>
                  {gate.name}
                </Badge>
              ))
            ) : (
              <span className='text-muted-foreground text-sm'>—</span>
            )}
          </div>
        )
      }
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
      const user = row.original
      const [formOpen, setFormOpen] = useState(false)
      const [deleteOpen, setDeleteOpen] = useState(false)
      const [changePasswordOpen, setChangePasswordOpen] = useState(false)
      const [activateDeactivateOpen, setActivateDeactivateOpen] = useState(false)
      const [activateDeactivateAction, setActivateDeactivateAction] = useState<'activate' | 'deactivate'>('activate')

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
              <span className='sr-only'>Edit {user.username}</span>
            </Button>
            <Button
              variant='ghost'
              size='icon'
              className='h-8 w-8'
              onClick={() => setChangePasswordOpen(true)}
            >
              <KeyRound className='h-4 w-4' />
              <span className='sr-only'>Change password for {user.username}</span>
            </Button>
            {user.isActive ? (
              <Button
                variant='ghost'
                size='icon'
                className='h-8 w-8 text-red-500 hover:text-red-600'
                onClick={() => {
                  setActivateDeactivateAction('deactivate')
                  setActivateDeactivateOpen(true)
                }}
              >
                <UserX className='h-4 w-4' />
                <span className='sr-only'>Deactivate {user.username}</span>
              </Button>
            ) : (
              <Button
                variant='ghost'
                size='icon'
                className='h-8 w-8 text-green-500 hover:text-green-600'
                onClick={() => {
                  setActivateDeactivateAction('activate')
                  setActivateDeactivateOpen(true)
                }}
              >
                <UserCheck className='h-4 w-4' />
                <span className='sr-only'>Activate {user.username}</span>
              </Button>
            )}
            <Button
              variant='ghost'
              size='icon'
              className='h-8 w-8 text-destructive hover:text-destructive'
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 className='h-4 w-4' />
              <span className='sr-only'>Delete {user.username}</span>
            </Button>
          </div>

          <UserFormDialog
            open={formOpen}
            onOpenChange={setFormOpen}
            user={user}
          />

          <UserChangePasswordDialog
            open={changePasswordOpen}
            onOpenChange={setChangePasswordOpen}
            user={user}
          />

          <UserDeleteDialog
            open={deleteOpen}
            onOpenChange={setDeleteOpen}
            user={user}
          />

          <UserActivateDeactivateDialog
            open={activateDeactivateOpen}
            onOpenChange={setActivateDeactivateOpen}
            user={user}
            action={activateDeactivateAction}
          />
        </>
      )
    },
  },
]

interface UsersTableProps {
  page: number
  perPage: number
  search: string
  onPageChange: (page: number) => void
  onPerPageChange: (perPage: number) => void
  onSearchChange: (search: string) => void
}

export function UsersTable({
  page,
  perPage,
  search,
  onPageChange,
  onPerPageChange,
  onSearchChange,
}: UsersTableProps) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const { data, isLoading, isError } = useUsers({
    page,
    perPage,
    search: search || undefined,
  })

  const users = data?.data ?? []
  const meta = data?.meta ?? { page: 1, perPage: 20, total: 0, totalPages: 0 }

  const pagination: PaginationState = {
    pageIndex: meta.page - 1,
    pageSize: meta.perPage,
  }

  const table = useReactTable({
    data: users,
    columns,
    getRowId: (row) => row.id,
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
          Failed to load users. Please try again.
        </p>
      </div>
    )
  }

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <Input
          placeholder='Search users...'
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
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className='h-24 text-center text-muted-foreground'
                >
                  No users found.
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

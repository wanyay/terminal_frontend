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
import { Truck, Car, User } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { DataTablePagination } from '@/components/data-table/pagination'
import { DataTableFacetedFilter } from '@/components/data-table/faceted-filter'
import { useGates } from '@/features/gates/api/queries'
import { useActiveTrucks, type ActiveTruck } from '@/features/exit/container-truck/api/queries'
import { useActiveVehicles, type ActiveVehicle } from '@/features/exit/visiting-vehicle/api/queries'
import { useActiveVisitors, type ActiveVisitor } from '@/features/exit/visitor/api/queries'
import { format } from 'date-fns'

// ==================== Container Trucks Table ====================

const truckColumns: ColumnDef<ActiveTruck>[] = [
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
      return <span className='text-muted-foreground text-sm'>{val || '—'}</span>
    },
  },
  {
    id: 'entryGate',
    header: 'Entry Gate',
    cell: ({ row }) => {
      const gate = row.original.entryGate
      return gate ? (
        <Badge variant='outline' className='text-xs'>{gate.name}</Badge>
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
      return <span className='text-sm'>{format(new Date(val), 'dd/MM/yyyy HH:mm')}</span>
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
]

// ==================== Visiting Vehicles Table ====================

const vehicleColumns: ColumnDef<ActiveVehicle>[] = [
  {
    accessorKey: 'plateNumber',
    header: 'Plate Number',
    cell: ({ row }) => (
      <span className='font-medium'>{row.getValue('plateNumber')}</span>
    ),
  },
  {
    accessorKey: 'entryGateId',
    header: 'Gate ID',
    enableHiding: true,
  },
  {
    accessorKey: 'visitorName',
    header: 'Visitor Name',
    cell: ({ row }) => {
      const val = row.getValue('visitorName') as string | null
      return <span>{val || '—'}</span>
    },
  },
  {
    accessorKey: 'vehicleType',
    header: 'Vehicle Type',
    cell: ({ row }) => {
      const val = row.getValue('vehicleType') as string | null
      return <span className='text-muted-foreground text-sm'>{val || '—'}</span>
    },
  },
  {
    accessorKey: 'companyName',
    header: 'Company',
    cell: ({ row }) => {
      const val = row.getValue('companyName') as string | null
      return <span className='text-muted-foreground text-sm'>{val || '—'}</span>
    },
  },
  {
    id: 'entryGate',
    header: 'Entry Gate',
    cell: ({ row }) => {
      const gate = row.original.entryGate
      return gate ? (
        <Badge variant='outline' className='text-xs'>{gate.name}</Badge>
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
      return <span className='text-sm'>{format(new Date(val), 'dd/MM/yyyy HH:mm')}</span>
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
]

// ==================== Visitors Table ====================

const visitorColumns: ColumnDef<ActiveVisitor>[] = [
  {
    accessorKey: 'visitorName',
    header: 'Visitor Name',
    cell: ({ row }) => (
      <span className='font-medium'>{row.getValue('visitorName')}</span>
    ),
  },
  {
    accessorKey: 'entryGateId',
    header: 'Gate ID',
    enableHiding: true,
  },
  {
    accessorKey: 'nrcOrPassport',
    header: 'NRC / Passport',
    cell: ({ row }) => {
      const val = row.getValue('nrcOrPassport') as string | null
      return <span className='text-muted-foreground text-sm'>{val || '—'}</span>
    },
  },
  {
    accessorKey: 'phoneNumber',
    header: 'Phone',
    cell: ({ row }) => {
      const val = row.getValue('phoneNumber') as string | null
      return <span className='text-muted-foreground text-sm'>{val || '—'}</span>
    },
  },
  {
    accessorKey: 'companyName',
    header: 'Company',
    cell: ({ row }) => {
      const val = row.getValue('companyName') as string | null
      return <span className='text-muted-foreground text-sm'>{val || '—'}</span>
    },
  },
  {
    accessorKey: 'hostEmployee',
    header: 'Host',
    cell: ({ row }) => {
      const val = row.getValue('hostEmployee') as string | null
      return <span>{val || '—'}</span>
    },
  },
  {
    id: 'entryGate',
    header: 'Entry Gate',
    cell: ({ row }) => {
      const gate = row.original.entryGate
      return gate ? (
        <Badge variant='outline' className='text-xs'>{gate.name}</Badge>
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
      return <span className='text-sm'>{format(new Date(val), 'dd/MM/yyyy HH:mm')}</span>
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
]

// ==================== Generic Active Table ====================

interface ActiveTableProps<TData> {
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

function ActiveTable<TData>({
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

// ==================== Live Monitoring Page ====================

type Tab = 'trucks' | 'vehicles' | 'visitors'

export default function LiveMonitoring() {
  const [activeTab, setActiveTab] = useState<Tab>('trucks')

  // Trucks state
  const [truckPage, setTruckPage] = useState(1)
  const [truckPerPage, setTruckPerPage] = useState(20)
  const [truckSearch, setTruckSearch] = useState('')
  const [truckGateId, setTruckGateId] = useState<string | undefined>()

  // Vehicles state
  const [vehiclePage, setVehiclePage] = useState(1)
  const [vehiclePerPage, setVehiclePerPage] = useState(20)
  const [vehicleSearch, setVehicleSearch] = useState('')
  const [vehicleGateId, setVehicleGateId] = useState<string | undefined>()

  // Visitors state
  const [visitorPage, setVisitorPage] = useState(1)
  const [visitorPerPage, setVisitorPerPage] = useState(20)
  const [visitorSearch, setVisitorSearch] = useState('')
  const [visitorGateId, setVisitorGateId] = useState<string | undefined>()

  const trucks = useActiveTrucks({ page: truckPage, perPage: truckPerPage, search: truckSearch || undefined, gateId: truckGateId })
  const vehicles = useActiveVehicles({ page: vehiclePage, perPage: vehiclePerPage, search: vehicleSearch || undefined, gateId: vehicleGateId })
  const visitors = useActiveVisitors({ page: visitorPage, perPage: visitorPerPage, search: visitorSearch || undefined, gateId: visitorGateId })

  return (
    <>
      <Header>
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='space-y-4'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>Live Monitoring</h1>
            <p className='text-muted-foreground text-sm'>
              Monitor active entries inside the port in real time
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as Tab)}>
            <TabsList>
              <TabsTrigger value='trucks'>
                <Truck className='mr-1.5 h-4 w-4' />
                Container Trucks
              </TabsTrigger>
              <TabsTrigger value='vehicles'>
                <Car className='mr-1.5 h-4 w-4' />
                Visiting Vehicles
              </TabsTrigger>
              <TabsTrigger value='visitors'>
                <User className='mr-1.5 h-4 w-4' />
                Visitors
              </TabsTrigger>
            </TabsList>

            <TabsContent value='trucks' className='mt-4'>
              <ActiveTable
                columns={truckColumns}
                data={trucks.data?.data}
                meta={trucks.data?.meta ?? { page: 1, perPage: 20, total: 0, totalPages: 0 }}
                isLoading={trucks.isLoading}
                isError={trucks.isError}
                page={truckPage}
                perPage={truckPerPage}
                search={truckSearch}
                gateId={truckGateId}
                searchPlaceholder='Search license plate...'
                emptyMessage='No active container trucks found.'
                errorMessage='Failed to load trucks. Please try again.'
                onPageChange={setTruckPage}
                onPerPageChange={setTruckPerPage}
                onSearchChange={setTruckSearch}
                onGateChange={setTruckGateId}
              />
            </TabsContent>

            <TabsContent value='vehicles' className='mt-4'>
              <ActiveTable
                columns={vehicleColumns}
                data={vehicles.data?.data}
                meta={vehicles.data?.meta ?? { page: 1, perPage: 20, total: 0, totalPages: 0 }}
                isLoading={vehicles.isLoading}
                isError={vehicles.isError}
                page={vehiclePage}
                perPage={vehiclePerPage}
                search={vehicleSearch}
                gateId={vehicleGateId}
                searchPlaceholder='Search plate number...'
                emptyMessage='No active visiting vehicles found.'
                errorMessage='Failed to load vehicles. Please try again.'
                onPageChange={setVehiclePage}
                onPerPageChange={setVehiclePerPage}
                onSearchChange={setVehicleSearch}
                onGateChange={setVehicleGateId}
              />
            </TabsContent>

            <TabsContent value='visitors' className='mt-4'>
              <ActiveTable
                columns={visitorColumns}
                data={visitors.data?.data}
                meta={visitors.data?.meta ?? { page: 1, perPage: 20, total: 0, totalPages: 0 }}
                isLoading={visitors.isLoading}
                isError={visitors.isError}
                page={visitorPage}
                perPage={visitorPerPage}
                search={visitorSearch}
                gateId={visitorGateId}
                searchPlaceholder='Search visitor name...'
                emptyMessage='No active visitors found.'
                errorMessage='Failed to load visitors. Please try again.'
                onPageChange={setVisitorPage}
                onPerPageChange={setVisitorPerPage}
                onSearchChange={setVisitorSearch}
                onGateChange={setVisitorGateId}
              />
            </TabsContent>
          </Tabs>
        </div>
      </Main>
    </>
  )
}

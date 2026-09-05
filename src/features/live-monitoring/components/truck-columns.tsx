import type { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/status-badge'
import type { useTranslation } from '@/context/language-provider'
import { type ActiveTruck } from '@/features/exit/container-truck/api/queries'
import { format } from 'date-fns'

type Translator = ReturnType<typeof useTranslation>['t']

export const truckColumns = (t: Translator): ColumnDef<ActiveTruck>[] => [
  {
    accessorKey: 'entryTime',
    header: t('liveMonitoring.entryTime' as never),
    cell: ({ row }) => {
      const val = row.getValue('entryTime') as string
      return <span className='text-sm'>{format(new Date(val), 'dd/MM/yyyy h:mma')}</span>
    },
  },
  {
    accessorKey: 'licensePlate',
    header: t('liveMonitoring.licensePlate' as never),
    cell: ({ row }) => (
      <span className='font-medium'>{row.getValue('licensePlate')}</span>
    ),
  },
  {
    accessorKey: 'entryGateId',
    header: t('liveMonitoring.gateId' as never),
    enableHiding: true,
  },
  {
    accessorKey: 'driverName',
    header: t('liveMonitoring.driverName' as never),
    cell: ({ row }) => {
      const val = row.getValue('driverName') as string | null
      return <span>{val || '—'}</span>
    },
  },
  {
    accessorKey: 'driverNrc',
    header: t('liveMonitoring.driverNrc' as never),
    cell: ({ row }) => {
      const val = row.getValue('driverNrc') as string | null
      return <span className='text-muted-foreground text-sm'>{val || '—'}</span>
    },
  },
  {
    id: 'entryGate',
    header: t('liveMonitoring.entryGate' as never),
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
    accessorKey: 'status',
    header: t('liveMonitoring.status' as never),
    cell: ({ row }) => {
      const status = row.getValue('status') as string
      return (
        <StatusBadge
          status={status}
          label={t(`statusBadges.${status.toLowerCase()}` as never)}
          className='text-xs'
        />
      )
    },
  },
]

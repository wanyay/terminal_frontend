import type { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/status-badge'
import type { useTranslation } from '@/context/language-provider'
import { type ActiveVehicle } from '@/features/exit/visiting-vehicle/api/queries'
import { format } from 'date-fns'

type Translator = ReturnType<typeof useTranslation>['t']

export const vehicleColumns = (t: Translator): ColumnDef<ActiveVehicle>[] => [
  {
    accessorKey: 'entryTime',
    header: t('liveMonitoring.entryTime' as never),
    cell: ({ row }) => {
      const val = row.getValue('entryTime') as string
      return <span className='text-sm'>{format(new Date(val), 'dd/MM/yyyy h:mma')}</span>
    },
  },
  {
    accessorKey: 'plateNumber',
    header: t('liveMonitoring.plateNumber' as never),
    cell: ({ row }) => (
      <span className='font-medium'>{row.getValue('plateNumber')}</span>
    ),
  },
  {
    accessorKey: 'entryGateId',
    header: t('liveMonitoring.gateId' as never),
    enableHiding: true,
  },
  {
    accessorKey: 'visitorName',
    header: t('liveMonitoring.visitorName' as never),
    cell: ({ row }) => {
      const val = row.getValue('visitorName') as string | null
      return <span>{val || '—'}</span>
    },
  },
  {
    accessorKey: 'vehicleType',
    header: t('liveMonitoring.vehicleType' as never),
    cell: ({ row }) => {
      const val = row.getValue('vehicleType') as string | null
      return <span className='text-muted-foreground text-sm'>{val || '—'}</span>
    },
  },
  {
    accessorKey: 'companyName',
    header: t('liveMonitoring.company' as never),
    cell: ({ row }) => {
      const val = row.getValue('companyName') as string | null
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

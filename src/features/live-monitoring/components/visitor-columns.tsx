import type { ColumnDef } from '@tanstack/react-table'
import { StatusBadge } from '@/components/status-badge'
import type { useTranslation } from '@/context/language-provider'
import { type ActiveVisitor } from '@/features/exit/visitor/api/queries'
import { format } from 'date-fns'

type Translator = ReturnType<typeof useTranslation>['t']

export const visitorColumns = (t: Translator): ColumnDef<ActiveVisitor>[] => [
  {
    accessorKey: 'entryTime',
    header: t('liveMonitoring.entryTime' as never),
    cell: ({ row }) => {
      const val = row.getValue('entryTime') as string
      return <span className='text-sm'>{format(new Date(val), 'dd/MM/yyyy h:mma')}</span>
    },
  },
  {
    accessorKey: 'visitorName',
    header: t('liveMonitoring.visitorName' as never),
    cell: ({ row }) => (
      <span className='font-medium'>{row.getValue('visitorName')}</span>
    ),
  },
  {
    accessorKey: 'entryGateId',
    header: t('liveMonitoring.gateId' as never),
    enableHiding: true,
  },
  {
    accessorKey: 'nrcOrPassport',
    header: t('liveMonitoring.nrcOrPassport' as never),
    cell: ({ row }) => {
      const val = row.getValue('nrcOrPassport') as string | null
      return <span className='text-muted-foreground text-sm'>{val || '—'}</span>
    },
  },
  {
    accessorKey: 'phoneNumber',
    header: t('liveMonitoring.phone' as never),
    cell: ({ row }) => {
      const val = row.getValue('phoneNumber') as string | null
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
    accessorKey: 'hostEmployee',
    header: t('liveMonitoring.host' as never),
    cell: ({ row }) => {
      const val = row.getValue('hostEmployee') as string | null
      return <span>{val || '—'}</span>
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

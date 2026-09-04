import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { useTranslation } from '@/context/language-provider'
import type { AuditLog } from '../api/queries'
import { parseUserAgent } from '../lib/user-agent'

interface AuditLogDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  log: AuditLog | null
}

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

function JsonDisplay({
  data,
  label,
}: {
  data: Record<string, unknown> | null
  label: string
}) {
  if (!data || Object.keys(data).length === 0) {
    return (
      <div>
        <p className='text-muted-foreground mb-1 text-sm font-medium'>
          {label}
        </p>
        <p className='text-muted-foreground text-sm'>—</p>
      </div>
    )
  }

  return (
    <div>
      <p className='text-muted-foreground mb-1 text-sm font-medium'>{label}</p>
      <div className='bg-muted/50 max-h-48 overflow-auto rounded-md p-3'>
        <pre className='text-sm break-words whitespace-pre-wrap'>
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </div>
  )
}

function ClientInfo({ log, t }: { log: AuditLog; t: Translator }) {
  const parsed = parseUserAgent(log.userAgent)

  if (!log.userAgent) {
    return <p className='text-muted-foreground text-sm'>—</p>
  }

  return (
    <div>
      <div className='grid grid-cols-2 gap-4'>
        <div>
          <p className='text-muted-foreground mb-1 text-sm font-medium'>
            {t('auditLogs.browser' as never)}
          </p>
          <p className='text-sm'>{parsed.browser}</p>
        </div>
        <div>
          <p className='text-muted-foreground mb-1 text-sm font-medium'>
            {t('auditLogs.operatingSystem' as never)}
          </p>
          <p className='text-sm'>{parsed.os}</p>
        </div>
        <div>
          <p className='text-muted-foreground mb-1 text-sm font-medium'>
            {t('auditLogs.device' as never)}
          </p>
          <p className='text-sm'>{parsed.device}</p>
        </div>
      </div>
      <details className='mt-3'>
        <summary className='text-muted-foreground cursor-pointer text-sm'>
          {t('auditLogs.showRawUserAgent' as never)}
        </summary>
        <p className='text-muted-foreground mt-2 rounded-md text-xs break-words'>
          {log.userAgent}
        </p>
      </details>
    </div>
  )
}

export function AuditLogDetailDialog({
  open,
  onOpenChange,
  log,
}: AuditLogDetailDialogProps) {
  const { t } = useTranslation()

  if (!log) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-2xl'>
        <DialogHeader>
          <DialogTitle>{t('auditLogs.dialogTitle' as never)}</DialogTitle>
          <DialogDescription>
            {t('auditLogs.dialogDesc' as never, {
              time: format(new Date(log.createdAt), 'dd/MM/yyyy HH:mm:ss'),
            })}
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <p className='text-muted-foreground mb-1 text-sm font-medium'>
                {t('auditLogs.user' as never)}
              </p>
              <p className='text-sm'>{log.username}</p>
            </div>
            <div>
              <p className='text-muted-foreground mb-1 text-sm font-medium'>
                {t('auditLogs.action' as never)}
              </p>
              <ActionBadge action={log.action} />
            </div>
            <div>
              <p className='text-muted-foreground mb-1 text-sm font-medium'>
                {t('auditLogs.module' as never)}
              </p>
              <p className='text-sm'>{log.module}</p>
            </div>
            <div>
              <p className='text-muted-foreground mb-1 text-sm font-medium'>
                {t('auditLogs.timestamp' as never)}
              </p>
              <p className='text-sm'>
                {format(new Date(log.createdAt), 'dd/MM/yyyy HH:mm:ss')}
              </p>
            </div>
            <div>
              <p className='text-muted-foreground mb-1 text-sm font-medium'>
                {t('auditLogs.ipAddress' as never)}
              </p>
              <p className='text-sm'>{log.ipAddress || '—'}</p>
            </div>
          </div>

          <div className='border-t pt-4'>
            <p className='mb-2 text-sm font-semibold'>
              {t('auditLogs.clientInfo' as never)}
            </p>
            <ClientInfo log={log} t={t} />
          </div>

          <div className='border-t pt-4'>
            <JsonDisplay data={log.oldValues} label={t('auditLogs.oldValues' as never)} />
          </div>

          <div>
            <JsonDisplay data={log.newValues} label={t('auditLogs.newValues' as never)} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

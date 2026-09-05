import { createFileRoute } from '@tanstack/react-router'
import { requirePermissions } from '@/lib/route-guards'
import { AuditLogsList } from '@/features/audit-logs'

export const Route = createFileRoute('/_authenticated/audit-logs')({
  beforeLoad: requirePermissions('VIEW_AUDIT_LOGS'),
  component: AuditLogsList,
})

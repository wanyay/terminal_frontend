import { createFileRoute } from '@tanstack/react-router'
import { requireRoles } from '@/lib/route-guards'
import { VisitorReportPage } from '@/features/reports'

export const Route = createFileRoute('/_authenticated/reports/visitors')({
  beforeLoad: requireRoles('SUPER_ADMIN', 'SUPERVISOR'),
  component: VisitorReportPage,
})

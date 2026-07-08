import { createFileRoute } from '@tanstack/react-router'
import { requireRoles } from '@/lib/route-guards'
import { TruckReportPage } from '@/features/reports'

export const Route = createFileRoute('/_authenticated/reports/trucks')({
  beforeLoad: requireRoles('SUPER_ADMIN', 'SUPERVISOR'),
  component: TruckReportPage,
})

import { createFileRoute } from '@tanstack/react-router'
import { requireRoles } from '@/lib/route-guards'
import { VehicleReportPage } from '@/features/reports'

export const Route = createFileRoute('/_authenticated/reports/vehicles')({
  beforeLoad: requireRoles('SUPER_ADMIN', 'SUPERVISOR'),
  component: VehicleReportPage,
})

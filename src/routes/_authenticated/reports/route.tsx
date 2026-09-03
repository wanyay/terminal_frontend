import { createFileRoute, Outlet } from '@tanstack/react-router'
import { requireRoles } from '@/lib/route-guards'

export const Route = createFileRoute('/_authenticated/reports')({
  beforeLoad: requireRoles('SUPER_ADMIN', 'SUPERVISOR'),
  component: Outlet,
})

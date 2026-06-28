import { createFileRoute, Outlet } from '@tanstack/react-router'
import { requireRoles } from '@/lib/route-guards'

export const Route = createFileRoute('/_authenticated/container-tuck')({
  beforeLoad: requireRoles('SUPER_ADMIN', 'SECURITY_OFFICER'),
  component: () => <Outlet />,
})

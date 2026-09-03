import { createFileRoute } from '@tanstack/react-router'
import { requireRoles } from '@/lib/route-guards'
import { BlacklistList } from '@/features/blacklist'

export const Route = createFileRoute('/_authenticated/blacklist')({
  beforeLoad: requireRoles('SUPER_ADMIN', 'SUPERVISOR'),
  component: BlacklistList,
})

import { createFileRoute } from '@tanstack/react-router'
import { TrucksList } from '@/features/trucks'
import { requireRoles } from '@/lib/route-guards'

export const Route = createFileRoute('/_authenticated/trucks')({
  beforeLoad: requireRoles('SUPER_ADMIN', 'SECURITY_OFFICER'),
  component: TrucksList,
})

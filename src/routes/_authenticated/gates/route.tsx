import { createFileRoute } from '@tanstack/react-router'
import { GatesList } from '@/features/gates'
import { requireRoles } from '@/lib/route-guards'

export const Route = createFileRoute('/_authenticated/gates')({
  beforeLoad: requireRoles('SUPER_ADMIN'),
  component: GatesList,
})

import { createFileRoute } from '@tanstack/react-router'
import { TrucksExitPage } from '@/features/trucks/pages/trucks-exit-page'
import { requireRoles } from '@/lib/route-guards'

export const Route = createFileRoute('/_authenticated/trucks/exit')({
  beforeLoad: requireRoles('SUPER_ADMIN', 'SECURITY_OFFICER'),
  component: TrucksExitPage,
})

import { createFileRoute } from '@tanstack/react-router'
import { TrucksEntryPage } from '@/features/trucks/pages/trucks-entry-page'
import { requireRoles } from '@/lib/route-guards'

export const Route = createFileRoute('/_authenticated/trucks/entry')({
  beforeLoad: requireRoles('SUPER_ADMIN', 'SECURITY_OFFICER'),
  component: TrucksEntryPage,
})

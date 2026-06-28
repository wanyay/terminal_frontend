import { createFileRoute } from '@tanstack/react-router'
import { TrucksEntryPage } from '@/features/trucks/pages/trucks-entry-page'
import { requireRoles, requireGateType } from '@/lib/route-guards'

export const Route = createFileRoute('/_authenticated/container-tuck/entry')({
  beforeLoad: () => {
    requireRoles('SUPER_ADMIN', 'SECURITY_OFFICER')()
    requireGateType('ENTRY')()
  },
  component: TrucksEntryPage,
})

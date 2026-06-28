import { createFileRoute } from '@tanstack/react-router'
import { TrucksExitPage } from '@/features/trucks/pages/trucks-exit-page'
import { requireRoles, requireGateType } from '@/lib/route-guards'

export const Route = createFileRoute('/_authenticated/container-tuck/exsit')({
  beforeLoad: () => {
    requireRoles('SUPER_ADMIN', 'SECURITY_OFFICER')()
    requireGateType('EXIT')()
  },
  component: TrucksExitPage,
})

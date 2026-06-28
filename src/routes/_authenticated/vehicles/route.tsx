import { createFileRoute } from '@tanstack/react-router'
import { VehiclesList } from '@/features/vehicles'
import { requireRoles, requireGateType } from '@/lib/route-guards'

export const Route = createFileRoute('/_authenticated/vehicles')({
  beforeLoad: () => {
    requireRoles('SUPER_ADMIN', 'SECURITY_OFFICER')()
    requireGateType('ENTRY')()
  },
  component: VehiclesList,
})

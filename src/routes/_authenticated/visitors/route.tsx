import { createFileRoute } from '@tanstack/react-router'
import { VisitorsList } from '@/features/visitors'
import { requireRoles, requireGateType } from '@/lib/route-guards'

export const Route = createFileRoute('/_authenticated/visitors')({
  beforeLoad: () => {
    requireRoles('SUPER_ADMIN', 'SECURITY_OFFICER')()
    requireGateType('ENTRY')()
  },
  component: VisitorsList,
})

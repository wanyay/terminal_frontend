import { createFileRoute } from '@tanstack/react-router'
import { UsersList } from '@/features/users'
import { requireRoles } from '@/lib/route-guards'

export const Route = createFileRoute('/_authenticated/users')({
  beforeLoad: requireRoles('SUPER_ADMIN'),
  component: UsersList,
})

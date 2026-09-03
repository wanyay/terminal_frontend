import { createFileRoute } from '@tanstack/react-router'
import { VisitorExitRegistration } from '@/features/exit/visitor'

export const Route = createFileRoute(
  '/_authenticated/exit-registration/visitor'
)({
  component: VisitorExitRegistration,
})

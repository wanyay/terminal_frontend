import { createFileRoute } from '@tanstack/react-router'
import { VisitorEntryRegistration } from '@/features/entry/visitor'

export const Route = createFileRoute(
  '/_authenticated/entry-registration/visitor'
)({
  component: VisitorEntryRegistration,
})

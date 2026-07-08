import { createFileRoute } from '@tanstack/react-router'
import { VisitorExitDetail } from '@/features/exit/visitor/pages/visitor-exit-detail'

export const Route = createFileRoute(
  '/_authenticated/exit-registration/visitor/$visitorId'
)({
  component: VisitorExitDetail,
})

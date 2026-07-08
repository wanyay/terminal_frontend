import { createFileRoute } from '@tanstack/react-router'
import { TruckExitDetail } from '@/features/exit/container-truck/pages/truck-exit-detail'

export const Route = createFileRoute(
  '/_authenticated/exit-registration/container-truck/$truckId'
)({
  component: TruckExitDetail,
})

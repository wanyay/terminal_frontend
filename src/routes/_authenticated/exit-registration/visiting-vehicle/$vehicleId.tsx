import { createFileRoute } from '@tanstack/react-router'
import { VehicleExitDetail } from '@/features/exit/visiting-vehicle/pages/vehicle-exit-detail'

export const Route = createFileRoute(
  '/_authenticated/exit-registration/visiting-vehicle/$vehicleId'
)({
  component: VehicleExitDetail,
})

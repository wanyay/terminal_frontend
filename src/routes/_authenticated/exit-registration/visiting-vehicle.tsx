import { createFileRoute } from '@tanstack/react-router'
import { VisitingVehicleExitRegistration } from '@/features/exit/visiting-vehicle'

export const Route = createFileRoute(
  '/_authenticated/exit-registration/visiting-vehicle'
)({
  component: VisitingVehicleExitRegistration,
})

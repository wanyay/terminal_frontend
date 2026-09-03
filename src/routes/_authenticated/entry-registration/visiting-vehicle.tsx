import { VisitingVehicleEntryRegistration } from '@/features/entry/visiting-vehicle'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_authenticated/entry-registration/visiting-vehicle',
)({
  component: VisitingVehicleEntryRegistration,
})

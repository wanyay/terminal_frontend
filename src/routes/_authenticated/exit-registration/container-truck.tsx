import { ContainerTruckExitRegistration } from '@/features/exit/container-truck'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_authenticated/exit-registration/container-truck'
)({
  component: ContainerTruckExitRegistration,
})

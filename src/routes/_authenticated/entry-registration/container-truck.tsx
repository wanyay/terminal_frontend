import { ContainerTruckEntryRegistration } from '@/features/entry/container-truck'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_authenticated/entry-registration/container-truck',
)({
  component: ContainerTruckEntryRegistration,
})

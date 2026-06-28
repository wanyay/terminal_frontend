import { createFileRoute } from '@tanstack/react-router'
import { TrucksList } from '@/features/trucks'

export const Route = createFileRoute('/_authenticated/container-tuck/')({
  component: TrucksList,
})

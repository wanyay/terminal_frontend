import { createFileRoute } from '@tanstack/react-router'
import LiveMonitoring from '@/features/live-monitoring'

export const Route = createFileRoute('/_authenticated/live-monitoring')({
  component: LiveMonitoring,
})

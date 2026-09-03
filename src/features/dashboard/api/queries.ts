import { useQuery } from '@tanstack/react-query'
import axiosClient from '@/lib/api/axiosClient'

export interface DashboardSummary {
  todayTruckEntries: number
  todayTruckExits: number
  todayVehicleEntries: number
  todayVehicleExits: number
  todayVisitorEntries: number
  todayVisitorExits: number
}

export interface DashboardInside {
  activeTrucks: number
  activeVehicles: number
  activeVisitors: number
}

export interface GateUsage {
  gateId: string
  gateName: string
  entries: number
  exits: number
}

export interface RecentActivity {
  id: string
  type: 'truck' | 'vehicle' | 'visitor'
  identifier: string
  name: string
  gateName: string
  status: string
  timestamp: string
}

export interface DashboardData {
  summary: DashboardSummary
  inside: DashboardInside
  gateUsage: GateUsage[]
  recentActivities: RecentActivity[]
}

export const dashboardKeys = {
  all: ['dashboard'] as const,
}

export function useDashboard() {
  return useQuery<DashboardData>({
    queryKey: dashboardKeys.all,
    queryFn: async () => {
      const res = await axiosClient.get<DashboardData>('/api/v1/dashboard')
      return res.data
    },
    refetchInterval: 30_000, // Auto-refresh every 30 seconds
  })
}

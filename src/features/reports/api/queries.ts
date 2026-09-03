import { useQuery } from '@tanstack/react-query'
import axiosClient from '@/lib/api/axiosClient'
import { saveExportedFile } from '@/lib/download-file'

export interface ReportGate {
  id: string
  code: string
  name: string
  type: 'ENTRY' | 'EXIT'
}

export interface TruckReport {
  id: string
  licensePlate: string
  containerNumber: string
  driverName: string | null
  driverNrc: string | null
  entryGateId: string | null
  exitGateId: string | null
  entryTime: string | null
  exitTime: string | null
  status: 'Entered' | 'Exited' | 'Cancelled' | string
  remarks: string | null
  entryGate: ReportGate | null
  exitGate: ReportGate | null
  createdAt: string
  updatedAt: string
}

export interface VehicleReport {
  id: string
  plateNumber: string
  vehicleType: string | null
  vehicleModel: string | null
  visitorName: string
  nrcOrLicense: string | null
  companyName: string | null
  purposeOfVisit: string | null
  entryGateId: string | null
  exitGateId: string | null
  entryTime: string | null
  exitTime: string | null
  status: 'ENTERED' | 'EXITED' | 'CANCELLED'
  remarks: string | null
  entryGate: ReportGate | null
  exitGate: ReportGate | null
  createdAt: string
  updatedAt: string
}

export interface VisitorReport {
  id: string
  visitorName: string
  nrcOrPassport: string | null
  phoneNumber: string | null
  companyName: string | null
  purposeOfVisit: string | null
  hostEmployee: string | null
  entryGateId: string | null
  exitGateId: string | null
  entryTime: string | null
  exitTime: string | null
  status: 'ENTERED' | 'EXITED' | 'CANCELLED'
  remarks: string | null
  entryGate: ReportGate | null
  exitGate: ReportGate | null
  createdAt: string
  updatedAt: string
}

export interface ReportsMeta {
  page: number
  perPage: number
  total: number
  totalPages: number
}

export interface ReportsResponse<T> {
  data: T[]
  meta: ReportsMeta
}

export interface ReportFilters {
  page?: number
  perPage?: number
  search?: string
  sortBy?: string
  sortOrder?: 'ASC' | 'DESC'
  startDate?: string
  endDate?: string
  entryGateId?: string
  exitGateId?: string
}

export const truckReportsKeys = {
  all: ['truck-reports'] as const,
  list: (params: ReportFilters) => ['truck-reports', 'list', params] as const,
}

export const vehicleReportsKeys = {
  all: ['vehicle-reports'] as const,
  list: (params: ReportFilters) => ['vehicle-reports', 'list', params] as const,
}

export const visitorReportsKeys = {
  all: ['visitor-reports'] as const,
  list: (params: ReportFilters) => ['visitor-reports', 'list', params] as const,
}

export function useTruckReports(params: ReportFilters) {
  const queryParams = new URLSearchParams()

  if (params.page) queryParams.set('page', String(params.page))
  if (params.perPage) queryParams.set('perPage', String(params.perPage))
  if (params.search) queryParams.set('search', params.search)
  if (params.sortBy) queryParams.set('sortBy', params.sortBy)
  if (params.sortOrder) queryParams.set('sortOrder', params.sortOrder)
  if (params.startDate) queryParams.set('startDate', params.startDate)
  if (params.endDate) queryParams.set('endDate', params.endDate)
  if (params.entryGateId) queryParams.set('entryGateId', params.entryGateId)
  if (params.exitGateId) queryParams.set('exitGateId', params.exitGateId)

  return useQuery<ReportsResponse<TruckReport>>({
    queryKey: truckReportsKeys.list(params),
    queryFn: async () => {
      const res = await axiosClient.get<TruckReport[]>(
        `/api/v1/trucks?${queryParams.toString()}`
      )
      const trucks = res.data as TruckReport[] & {
        meta?: ReportsResponse<TruckReport>['meta']
      }

      return {
        data: trucks,
        meta: trucks.meta ?? {
          page: 1,
          perPage: 20,
          total: 0,
          totalPages: 0,
        },
      }
    },
  })
}

export type TruckReportExportFilters = Omit<ReportFilters, 'page' | 'perPage'>

export function exportTruckReports(params: TruckReportExportFilters) {
  return saveExportedFile(
    '/api/v1/trucks/export',
    {
      search: params.search,
      sortBy: params.sortBy,
      sortOrder: params.sortOrder,
      startDate: params.startDate,
      endDate: params.endDate,
      entryGateId: params.entryGateId,
      exitGateId: params.exitGateId,
    },
    'container-trucks.xlsx'
  )
}

export type VehicleReportExportFilters = Omit<ReportFilters, 'page' | 'perPage'>

export function exportVehicleReports(params: VehicleReportExportFilters) {
  return saveExportedFile(
    '/api/v1/vehicles/export',
    {
      search: params.search,
      sortBy: params.sortBy,
      sortOrder: params.sortOrder,
      startDate: params.startDate,
      endDate: params.endDate,
      entryGateId: params.entryGateId,
      exitGateId: params.exitGateId,
    },
    'visiting-vehicles.xlsx'
  )
}

export type VisitorReportExportFilters = Omit<ReportFilters, 'page' | 'perPage'>

export function exportVisitorReports(params: VisitorReportExportFilters) {
  return saveExportedFile(
    '/api/v1/visitors/export',
    {
      search: params.search,
      sortBy: params.sortBy,
      sortOrder: params.sortOrder,
      startDate: params.startDate,
      endDate: params.endDate,
      entryGateId: params.entryGateId,
      exitGateId: params.exitGateId,
    },
    'visitors.xlsx'
  )
}

export function useVehicleReports(params: ReportFilters) {
  const queryParams = new URLSearchParams()

  if (params.page) queryParams.set('page', String(params.page))
  if (params.perPage) queryParams.set('perPage', String(params.perPage))
  if (params.search) queryParams.set('search', params.search)
  if (params.sortBy) queryParams.set('sortBy', params.sortBy)
  if (params.sortOrder) queryParams.set('sortOrder', params.sortOrder)
  if (params.startDate) queryParams.set('startDate', params.startDate)
  if (params.endDate) queryParams.set('endDate', params.endDate)
  if (params.entryGateId) queryParams.set('entryGateId', params.entryGateId)
  if (params.exitGateId) queryParams.set('exitGateId', params.exitGateId)

  return useQuery<ReportsResponse<VehicleReport>>({
    queryKey: vehicleReportsKeys.list(params),
    queryFn: async () => {
      const res = await axiosClient.get<VehicleReport[]>(
        `/api/v1/vehicles?${queryParams.toString()}`
      )
      const vehicles = res.data as VehicleReport[] & {
        meta?: ReportsResponse<VehicleReport>['meta']
      }

      return {
        data: vehicles,
        meta: vehicles.meta ?? {
          page: 1,
          perPage: 20,
          total: 0,
          totalPages: 0,
        },
      }
    },
  })
}

export function useVisitorReports(params: ReportFilters) {
  const queryParams = new URLSearchParams()

  if (params.page) queryParams.set('page', String(params.page))
  if (params.perPage) queryParams.set('perPage', String(params.perPage))
  if (params.search) queryParams.set('search', params.search)
  if (params.sortBy) queryParams.set('sortBy', params.sortBy)
  if (params.sortOrder) queryParams.set('sortOrder', params.sortOrder)
  if (params.startDate) queryParams.set('startDate', params.startDate)
  if (params.endDate) queryParams.set('endDate', params.endDate)
  if (params.entryGateId) queryParams.set('entryGateId', params.entryGateId)
  if (params.exitGateId) queryParams.set('exitGateId', params.exitGateId)

  return useQuery<ReportsResponse<VisitorReport>>({
    queryKey: visitorReportsKeys.list(params),
    queryFn: async () => {
      const res = await axiosClient.get<VisitorReport[]>(
        `/api/v1/visitors?${queryParams.toString()}`
      )
      const visitors = res.data as VisitorReport[] & {
        meta?: ReportsResponse<VisitorReport>['meta']
      }

      return {
        data: visitors,
        meta: visitors.meta ?? {
          page: 1,
          perPage: 20,
          total: 0,
          totalPages: 0,
        },
      }
    },
  })
}

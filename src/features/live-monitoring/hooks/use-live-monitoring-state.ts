import { useState } from 'react'

export type LiveMonitoringTab = 'trucks' | 'vehicles' | 'visitors'

interface TableState {
  page: number
  setPage: (page: number) => void
  perPage: number
  setPerPage: (perPage: number) => void
  search: string
  setSearch: (search: string) => void
  gateId?: string
  setGateId: (gateId: string | undefined) => void
}

const useTableState = (): TableState => {
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(20)
  const [search, setSearch] = useState('')
  const [gateId, setGateId] = useState<string | undefined>()
  return { page, setPage, perPage, setPerPage, search, setSearch, gateId, setGateId }
}

export function useLiveMonitoringState() {
  const [activeTab, setActiveTab] = useState<LiveMonitoringTab>('trucks')
  const trucks = useTableState()
  const vehicles = useTableState()
  const visitors = useTableState()

  return {
    activeTab,
    setActiveTab,
    trucks,
    vehicles,
    visitors,
  }
}

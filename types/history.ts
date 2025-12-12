export interface History {
  id: string
  vehicleId: string
  oldPrice: number
  newPrice: number
  oldBuyPrice: number
  newBuyPrice: number
  userId: string
  createdAt?: Date
}

export interface HistoryDisplay {
  id: string
  vehicleId: string
  nameVehicle: string
  brand: string
  type: string
  year: number
  engineCapacity: string
  oldPrice: number
  newPrice: number
  oldBuyPrice: number
  newBuyPrice: number
  staffName: string
  createdAt: Date
}

export interface HistoryPaginationParams {
  page: number
  limit: number
  brand?: string
  type?: string
  year?: string
  engineCapacity?: string
  sortBy?: "createdAt" | "createdAtOld" | "nameAsc" | "nameDesc"
}

export interface HistoryPaginationResult {
  data: HistoryDisplay[]
  total: number
  page: number
  limit: number
  totalPages: number
}

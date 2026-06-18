export interface Asset {
  id: string
  vehicleName: string
  plateNumber: string
  vehicleIdNumber: string
  customerName: string
  userId: string
  createdBy: string
  note?: string
  createdAt: string | Date
  updatedAt: string | Date
}

export interface CreateAssetDto {
  vehicleName: string
  plateNumber: string
  vehicleIdNumber: string
  customerName: string
  note?: string
}

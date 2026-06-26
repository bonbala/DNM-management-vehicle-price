export type ViolationStatus = "pending" | "processed"

export interface Evidence {
  url: string
  publicId: string
  name: string
  resourceType: "image" | "video"
}

export interface ViolationContract {
  id: string
  customerName: string
  phoneNumber: string
  customerId: string
  address: string
  vehicleName: string
  violationMoney: number
  violationDate: string | Date
  status: ViolationStatus
  notes?: string
  evidences?: Evidence[]
  createdBy: string
  createdAt: string | Date
  updatedAt: string | Date
}

export interface CreateViolationContractDto {
  customerName: string
  phoneNumber: string
  customerId: string
  address: string
  vehicleName: string
  violationMoney: number
  violationDate: string
  status: ViolationStatus
  notes?: string
  evidences?: Evidence[]
}

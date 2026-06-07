export type ViolationStatus = "pending" | "processed"

export interface ViolationContract {
  id: string
  customerName: string
  phoneNumber: string
  customerId: string
  address: string
  vehicleName: string
  violationDate: string | Date
  status: ViolationStatus
  notes?: string
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
  violationDate: string
  status: ViolationStatus
  notes?: string
}

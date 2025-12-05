export interface GeolocationCoordinates {
  latitude: number
  longitude: number
  accuracy: number
}

export interface AuditLog {
  id: string
  userId: string
  username: string
  action: "LOGIN_SUCCESS" | "LOGIN_FAILED" | "LOGOUT"
  ipAddress: string
  userAgent: string
  timestamp: Date
  geolocation?: GeolocationCoordinates
  failureReason?: string
  details?: Record<string, any>
}

export interface CreateAuditLogInput {
  userId: string
  username: string
  action: "LOGIN_SUCCESS" | "LOGIN_FAILED" | "LOGOUT"
  ipAddress: string
  userAgent: string
  geolocation?: GeolocationCoordinates
  failureReason?: string
  details?: Record<string, any>
}

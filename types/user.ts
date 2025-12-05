export type UserRole = "super_admin" | "admin" | "user"

export interface User {
  id: string
  username: string
  staffName: string
  role: UserRole
  createdAt?: Date
  updatedAt?: Date
}

import type { GeolocationCoordinates } from "./audit-log"

export interface AuthContext {
  user: User | null
  isAuthenticated: boolean
  login: (username: string, password: string, geolocation: GeolocationCoordinates) => Promise<void>
  logout: () => void
  canAccess: (requiredRoles: UserRole[]) => boolean
}

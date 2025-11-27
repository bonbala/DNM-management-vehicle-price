export type UserRole = "super_admin" | "admin" | "user"

export interface User {
  id: string
  username: string
  staffName: string
  role: UserRole
  createdAt?: Date
  updatedAt?: Date
}

export interface AuthContext {
  user: User | null
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  canAccess: (requiredRoles: UserRole[]) => boolean
}

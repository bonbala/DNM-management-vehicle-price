"use client"

import React, { createContext, useContext, useState, useCallback } from "react"
import type { User, AuthContext as AuthContextType, UserRole } from "@/types/user"

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  const login = useCallback(async (username: string, password: string) => {
    try {
      // Gọi API để đăng nhập
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Đăng nhập thất bại")
      }

      const { user: userData, token } = await response.json()

      setUser(userData)
      // Store user và token in localStorage
      localStorage.setItem("user", JSON.stringify(userData))
      localStorage.setItem("token", token)
    } catch (error) {
      throw error
    }
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem("user")
    localStorage.removeItem("token")
  }, [])

  const canAccess = useCallback(
    (requiredRoles: UserRole[]) => {
      if (!user) return false
      return requiredRoles.includes(user.role)
    },
    [user],
  )

  // Restore user from localStorage on mount
  React.useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (error) {
        console.error("Failed to parse stored user:", error)
      }
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, canAccess }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}

"use client"

import React, { createContext, useContext, useState, useCallback, useRef } from "react"
import type { User, AuthContext as AuthContextType, UserRole } from "@/types/user"

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Auto-refresh token 1 minute before expiry
const REFRESH_BUFFER_MS = 60 * 1000 // 1 minute

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Cancel pending refresh timeout
  const cancelRefreshTimeout = useCallback(() => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current)
      refreshTimeoutRef.current = null
    }
  }, [])

  // Schedule automatic token refresh
  const scheduleTokenRefresh = useCallback(
    (expiryTime: number) => {
      cancelRefreshTimeout()

      const now = Date.now()
      const timeUntilExpiry = expiryTime - now
      const refreshTime = timeUntilExpiry - REFRESH_BUFFER_MS

      if (refreshTime > 0) {
        console.log("[v0] Token refresh scheduled in", Math.round(refreshTime / 1000), "seconds")

        refreshTimeoutRef.current = setTimeout(() => {
          console.log("[v0] Auto-refreshing access token...")
          refreshAccessToken()
        }, refreshTime)
      }
    },
    [cancelRefreshTimeout]
  )

  // Refresh access token using refresh token
  const refreshAccessToken = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/refresh", {
        method: "POST",
        credentials: "include", // Include cookies
      })

      if (!response.ok) {
        console.log("[v0] Token refresh failed, logging out")
        logout()
        return
      }

      const { user: userData, accessTokenExpiry } = await response.json()

      setUser(userData)
      // Schedule next refresh
      scheduleTokenRefresh(accessTokenExpiry)
    } catch (error) {
      console.error("[v0] Token refresh error:", error)
      logout()
    }
  }, [scheduleTokenRefresh])

  const login = useCallback(
    async (username: string, password: string) => {
      try {
        // Call API to login
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // Include cookies
          body: JSON.stringify({ username, password }),
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || "Đăng nhập thất bại")
        }

        const { user: userData, accessTokenExpiry } = await response.json()

        setUser(userData)
        // Cookies are set automatically by the server
        // Schedule token refresh
        scheduleTokenRefresh(accessTokenExpiry)
      } catch (error) {
        throw error
      }
    },
    [scheduleTokenRefresh]
  )

  const logout = useCallback(() => {
    setUser(null)
    cancelRefreshTimeout()

    // Clear refresh token cookie
    fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    }).catch((err) => console.error("[v0] Logout error:", err))
  }, [cancelRefreshTimeout])

  const canAccess = useCallback(
    (requiredRoles: UserRole[]) => {
      if (!user) return false
      return requiredRoles.includes(user.role)
    },
    [user]
  )

  // Restore user from cookies on mount
  React.useEffect(() => {
    const restoreSession = async () => {
      try {
        // Try to verify token by calling /api/auth/me
        const response = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "include", // Include cookies
        })

        if (!response.ok) {
          console.log("[v0] Session verification failed")
          logout()
          return
        }

        const { user: userData, accessTokenExpiry } = await response.json()
        setUser(userData)

        // Schedule token refresh
        if (accessTokenExpiry) {
          scheduleTokenRefresh(accessTokenExpiry)
        }
      } catch (error) {
        console.warn("[v0] Session restore failed:", error)
        logout()
      }
    }

    // Only restore if running in browser
    if (typeof window !== "undefined") {
      restoreSession()
    }

    return () => {
      cancelRefreshTimeout()
    }
  }, [scheduleTokenRefresh, logout, cancelRefreshTimeout])

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

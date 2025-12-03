import { type NextRequest, NextResponse } from "next/server"
import type { UserRole } from "@/types/user"
import { verifyAccessToken } from "@/lib/jwt-utils"

export interface TokenPayload {
  userId: string
  username: string
  role: UserRole
  iat?: number
  exp?: number
}

// Parse and verify JWT access token from Authorization header or cookies
export function parseToken(token: string): TokenPayload | null {
  try {
    // Handle null, undefined, or "null" string
    if (!token || token === "null" || token.trim().length === 0) {
      console.log("[v0] Token is empty or null")
      return null
    }

    console.log("[v0] Attempting to parse JWT token, first 20 chars:", token.substring(0, 20))

    // Verify JWT token
    const payload = verifyAccessToken(token)

    if (!payload) {
      console.log("[v0] Token verification failed")
      return null
    }

    if (payload.userId && payload.username && payload.role) {
      console.log("[v0] Token parsed successfully, userId:", payload.userId)
      return {
        userId: payload.userId,
        username: payload.username,
        role: payload.role,
        iat: payload.iat,
        exp: payload.exp,
      }
    }

    console.log("[v0] Invalid token payload - missing fields")
    return null
  } catch (error) {
    console.error("[v0] Token parse error:", error instanceof Error ? error.message : String(error))
    return null
  }
}

export function requireAuth(
  request: NextRequest,
  allowedRoles?: UserRole[],
): { isValid: boolean; response?: NextResponse; user?: TokenPayload } {
  // 1. Try to get token from Authorization header
  let token: string | null = null
  const authHeader = request.headers.get("authorization")

  if (authHeader?.startsWith("Bearer ")) {
    token = authHeader.substring(7)
    console.log("[v0] Token from Authorization header")
  }

  // 2. If no header token, try to get from cookies
  if (!token) {
    token = request.cookies.get("accessToken")?.value || null
    if (token) {
      console.log("[v0] Token from accessToken cookie")
    }
  }

  // DEBUG: Log all cookies
  const allCookies = request.cookies.getAll()
  if (allCookies.length === 0) {
    console.log("[v0] WARNING: No cookies received in request!")
  } else {
    console.log("[v0] Cookies received:", allCookies.map(c => c.name).join(", "))
  }

  if (!token) {
    console.log("[v0] No token found in headers or cookies")
    return {
      isValid: false,
      response: NextResponse.json({ error: "Unauthorized - Vui lòng đăng nhập" }, { status: 401 }),
    }
  }

  const user = parseToken(token)

  if (!user) {
    return {
      isValid: false,
      response: NextResponse.json({ error: "Invalid token" }, { status: 401 }),
    }
  }

  // Check role-based access
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return {
      isValid: false,
      response: NextResponse.json({ error: "Forbidden - Không có quyền truy cập" }, { status: 403 }),
    }
  }

  return { isValid: true, user }
}

import { type NextRequest, NextResponse } from "next/server"
import type { UserRole } from "@/types/user"

export interface TokenPayload {
  userId: string
  username: string
  role: UserRole
}

// Parse token from base64 encoding (database-backed tokens only)
export function parseToken(token: string): TokenPayload | null {
  try {
    console.log("[v0] Attempting to parse token, first 20 chars:", token.substring(0, 20))
    
    // Validate token format - should be valid base64
    if (!token || token.trim().length === 0) {
      console.log("[v0] Token is empty")
      return null
    }

    // Check if token looks like a valid base64 (only alphanumeric, +, /, =)
    if (!/^[A-Za-z0-9+/]*={0,2}$/.test(token)) {
      console.log("[v0] Token does not look like valid base64")
      return null
    }

    // Parse as base64 (new format from login)
    const decoded = Buffer.from(token, "base64").toString("utf-8")
    
    // Check if decoded string looks like JSON
    if (!decoded.startsWith("{") || !decoded.endsWith("}")) {
      console.log("[v0] Decoded token is not valid JSON format")
      return null
    }

    const payload = JSON.parse(decoded)
    
    if (payload.userId && payload.username && payload.role) {
      console.log("[v0] Token parsed successfully, userId:", payload.userId)
      return {
        userId: payload.userId,
        username: payload.username,
        role: payload.role as UserRole,
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
  const authHeader = request.headers.get("authorization")

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return {
      isValid: false,
      response: NextResponse.json({ error: "Unauthorized - Vui lòng đăng nhập" }, { status: 401 }),
    }
  }

  const token = authHeader.substring(7)
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

import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-middleware"
import { UserService } from "@/lib/services/user-service"
import { getAccessTokenExpiry } from "@/lib/jwt-utils"

/**
 * Get current authenticated user
 * Used to verify token validity on app restore
 * 
 * Accepts token from:
 * 1. Authorization header (Bearer token)
 * 2. accessToken cookie
 */
export async function GET(request: NextRequest) {
  const authCheck = requireAuth(request)

  if (!authCheck.isValid || !authCheck.user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    )
  }

  try {
    const user = await UserService.getUserById(authCheck.user.userId)

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    const accessTokenExpiry = getAccessTokenExpiry()

    return NextResponse.json(
      { 
        user,
        accessTokenExpiry,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("[v0] GET /api/auth/me error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Lỗi server" },
      { status: 500 }
    )
  }
}

import { type NextRequest, NextResponse } from "next/server"
import { generateAccessToken, getAccessTokenExpiry, verifyRefreshToken } from "@/lib/jwt-utils"
import { UserService } from "@/lib/services/user-service"
import { cookies } from "next/headers"

/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token from cookie
 */
export async function POST(request: NextRequest) {
  try {
    // Get refresh token from cookie
    const cookieStore = await cookies()
    const refreshToken = cookieStore.get("refreshToken")?.value

    if (!refreshToken) {
      return NextResponse.json(
        { error: "Refresh token not found. Vui lòng đăng nhập lại." },
        { status: 401 }
      )
    }

    // Verify refresh token
    const payload = verifyRefreshToken(refreshToken)
    if (!payload) {
      return NextResponse.json(
        { error: "Refresh token không hợp lệ. Vui lòng đăng nhập lại." },
        { status: 401 }
      )
    }

    // Get updated user info
    const user = await UserService.getUserById(payload.userId)
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Generate new access token
    const newAccessToken = generateAccessToken(
      user.id,
      user.username,
      user.role
    )

    const accessTokenExpiry = getAccessTokenExpiry()

    // Set new access token as HttpOnly cookie
    const response = NextResponse.json(
      {
        user,
        accessToken: newAccessToken,
        accessTokenExpiry,
      },
      { status: 200 }
    )

    response.cookies.set({
      name: "accessToken",
      value: newAccessToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 15 * 60, // 15 minutes in seconds
    })

    return response
  } catch (error) {
    console.error("[v0] POST /api/auth/refresh error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Lỗi khi làm mới token" },
      { status: 500 }
    )
  }
}

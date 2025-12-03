import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

/**
 * POST /api/auth/logout
 * Clear authentication cookies
 */
export async function POST(request: NextRequest) {
  try {
    const response = NextResponse.json(
      { message: "Đăng xuất thành công" },
      { status: 200 }
    )

    // Clear access token cookie
    response.cookies.set({
      name: "accessToken",
      value: "",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 0, // Immediate expiry
    })

    // Clear refresh token cookie
    response.cookies.set({
      name: "refreshToken",
      value: "",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 0, // Immediate expiry
    })

    return response
  } catch (error) {
    console.error("[v0] POST /api/auth/logout error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Lỗi khi đăng xuất" },
      { status: 500 }
    )
  }
}

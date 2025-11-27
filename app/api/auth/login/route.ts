import { type NextRequest, NextResponse } from "next/server"
import { UserService } from "@/lib/services/user-service"
import crypto from "crypto"

// Simple token generation (mock - in production use JWT)
function generateToken(userId: string, username: string, role: string): string {
  // Create a simple token that includes userId
  const data = JSON.stringify({ userId, username, role, timestamp: Date.now() })
  return Buffer.from(data).toString("base64")
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password } = body

    if (!username || !password) {
      return NextResponse.json(
        { error: "Tài khoản và mật khẩu không được để trống" },
        { status: 400 },
      )
    }

    // Kiểm tra xác thực với database
    const user = await UserService.authenticateUser(username, password)

    if (!user) {
      return NextResponse.json(
        { error: "Tài khoản hoặc mật khẩu không chính xác" },
        { status: 401 },
      )
    }

    // Tạo token với userId thực từ database
    const token = generateToken(user.id, user.username, user.role)

    return NextResponse.json(
      {
        user,
        token,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("[v0] POST /api/auth/login error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Lỗi khi đăng nhập" },
      { status: 500 },
    )
  }
}

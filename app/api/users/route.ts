import { type NextRequest, NextResponse } from "next/server"
import { UserService } from "@/lib/services/user-service"
import { requireAuth } from "@/lib/auth-middleware"

export async function GET(request: NextRequest) {
  const authCheck = requireAuth(request, ["super_admin"])
  if (!authCheck.isValid) {
    return authCheck.response!
  }

  try {
    const users = await UserService.getAllUsers()
    return NextResponse.json(users)
  } catch (error) {
    console.error("[v0] GET /api/users error:", error)
    return NextResponse.json({ error: "Lỗi khi lấy danh sách tài khoản" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const authCheck = requireAuth(request, ["super_admin"])
  if (!authCheck.isValid) {
    return authCheck.response!
  }

  try {
    const body = await request.json()
    const { username, staffName, password, role } = body

    if (!username || !staffName || !password) {
      return NextResponse.json(
        { error: "Tài khoản, tên nhân viên và mật khẩu không được để trống" },
        { status: 400 },
      )
    }

    const newUser = await UserService.createUser(username, staffName, password, role || "user")
    return NextResponse.json(newUser, { status: 201 })
  } catch (error) {
    console.error("[v0] POST /api/users error:", error)
    const message = error instanceof Error ? error.message : "Lỗi khi tạo tài khoản mới"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

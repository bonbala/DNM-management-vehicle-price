import { type NextRequest, NextResponse } from "next/server"
import { UserService } from "@/lib/services/user-service"
import { requireAuth } from "@/lib/auth-middleware"

/**
 * POST /api/users/[id]/reset-password
 * Admin resets user password (without verification of old password)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authCheck = requireAuth(request, ["super_admin", "admin"])
  if (!authCheck.isValid) {
    return authCheck.response!
  }

  try {
    const { id } = await params
    if (!id) {
      return NextResponse.json({ error: "ID không hợp lệ" }, { status: 400 })
    }

    const body = await request.json()
    const { newPassword } = body

    if (!newPassword) {
      return NextResponse.json(
        { error: "Mật khẩu mới không được để trống" },
        { status: 400 }
      )
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "Mật khẩu phải có ít nhất 6 ký tự" },
        { status: 400 }
      )
    }

    const success = await UserService.resetPassword(id, newPassword)
    if (!success) {
      return NextResponse.json({ error: "Không tìm thấy tài khoản" }, { status: 404 })
    }

    return NextResponse.json({
      message: "Đặt lại mật khẩu thành công",
      success: true,
    })
  } catch (error) {
    console.error("[v0] POST /api/users/[id]/reset-password error:", error)
    return NextResponse.json(
      { error: "Lỗi khi đặt lại mật khẩu" },
      { status: 500 }
    )
  }
}

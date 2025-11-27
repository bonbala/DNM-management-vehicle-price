import { type NextRequest, NextResponse } from "next/server"
import { UserService } from "@/lib/services/user-service"
import { requireAuth } from "@/lib/auth-middleware"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authCheck = requireAuth(request, ["super_admin"])
  if (!authCheck.isValid) {
    return authCheck.response!
  }

  try {
    const { id } = await params
    if (!id) {
      return NextResponse.json({ error: "ID không hợp lệ" }, { status: 400 })
    }

    const user = await UserService.getUserById(id)
    if (!user) {
      return NextResponse.json({ error: "Không tìm thấy tài khoản" }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("[v0] GET /api/users/[id] error:", error)
    return NextResponse.json({ error: "Lỗi khi lấy thông tin tài khoản" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authCheck = requireAuth(request, ["super_admin"])
  if (!authCheck.isValid) {
    return authCheck.response!
  }

  try {
    const { id } = await params
    if (!id) {
      return NextResponse.json({ error: "ID không hợp lệ" }, { status: 400 })
    }

    const body = await request.json()
    const { role, staffName } = body

    // Validate role
    if (role && !["super_admin", "admin", "user"].includes(role)) {
      return NextResponse.json({ error: "Role không hợp lệ" }, { status: 400 })
    }

    const updates: any = {}
    if (role) updates.role = role
    if (staffName) updates.staffName = staffName

    const updated = await UserService.updateUser(id, updates)
    if (!updated) {
      return NextResponse.json({ error: "Không tìm thấy tài khoản" }, { status: 404 })
    }

    return NextResponse.json(updated)
  } catch (error) {
    console.error("[v0] PUT /api/users/[id] error:", error)
    return NextResponse.json({ error: "Lỗi khi cập nhật tài khoản" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authCheck = requireAuth(request, ["super_admin"])
  if (!authCheck.isValid) {
    return authCheck.response!
  }

  try {
    const { id } = await params
    if (!id) {
      return NextResponse.json({ error: "ID không hợp lệ" }, { status: 400 })
    }

    const deleted = await UserService.deleteUser(id)
    if (!deleted) {
      return NextResponse.json({ error: "Không tìm thấy tài khoản" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] DELETE /api/users/[id] error:", error)
    return NextResponse.json({ error: "Lỗi khi xóa tài khoản" }, { status: 500 })
  }
}

import { type NextRequest, NextResponse } from "next/server"
import { AssetService } from "@/lib/services/asset-service"
import { requireAuth } from "@/lib/auth-middleware"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authCheck = requireAuth(request)
  if (!authCheck.isValid) return authCheck.response!

  try {
    const { id } = await params
    const asset = await AssetService.getById(id)
    if (!asset) return NextResponse.json({ error: "Không tìm thấy tài sản" }, { status: 404 })
    return NextResponse.json(asset)
  } catch (error) {
    console.error("[qlts] GET[id] error:", error)
    return NextResponse.json({ error: "Lỗi khi lấy tài sản" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authCheck = requireAuth(request, ["admin", "super_admin"])
  if (!authCheck.isValid) return authCheck.response!

  try {
    const { id } = await params
    const body = await request.json()
    const asset = await AssetService.update(id, body)
    if (!asset) return NextResponse.json({ error: "Không tìm thấy tài sản" }, { status: 404 })
    return NextResponse.json(asset)
  } catch (error) {
    console.error("[qlts] PUT error:", error)
    const message = error instanceof Error ? error.message : "Lỗi khi cập nhật tài sản"
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authCheck = requireAuth(request, ["admin", "super_admin"])
  if (!authCheck.isValid) return authCheck.response!

  try {
    const { id } = await params
    const deleted = await AssetService.delete(id)
    if (!deleted) return NextResponse.json({ error: "Không tìm thấy tài sản" }, { status: 404 })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[qlts] DELETE error:", error)
    return NextResponse.json({ error: "Lỗi khi xóa tài sản" }, { status: 500 })
  }
}

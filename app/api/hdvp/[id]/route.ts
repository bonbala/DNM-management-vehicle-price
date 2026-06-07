import { type NextRequest, NextResponse } from "next/server"
import { ViolationContractService } from "@/lib/services/violation-contract-service"
import { requireAuth } from "@/lib/auth-middleware"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authCheck = requireAuth(request)
  if (!authCheck.isValid) return authCheck.response!

  try {
    const { id } = await params
    const contract = await ViolationContractService.getById(id)
    if (!contract) return NextResponse.json({ error: "Không tìm thấy hợp đồng" }, { status: 404 })
    return NextResponse.json(contract)
  } catch (error) {
    console.error("[hdvp] GET[id] error:", error)
    return NextResponse.json({ error: "Lỗi khi lấy hợp đồng" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authCheck = requireAuth(request, ["admin", "super_admin"])
  if (!authCheck.isValid) return authCheck.response!

  try {
    const { id } = await params
    const body = await request.json()
    const contract = await ViolationContractService.update(id, body)
    if (!contract) return NextResponse.json({ error: "Không tìm thấy hợp đồng" }, { status: 404 })
    return NextResponse.json(contract)
  } catch (error) {
    console.error("[hdvp] PUT error:", error)
    const message = error instanceof Error ? error.message : "Lỗi khi cập nhật dữ liệu vi phạm"
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authCheck = requireAuth(request, ["admin", "super_admin"])
  if (!authCheck.isValid) return authCheck.response!

  try {
    const { id } = await params
    const deleted = await ViolationContractService.delete(id)
    if (!deleted) return NextResponse.json({ error: "Không tìm thấy hợp đồng" }, { status: 404 })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[hdvp] DELETE error:", error)
    return NextResponse.json({ error: "Lỗi khi xóa hợp đồng" }, { status: 500 })
  }
}

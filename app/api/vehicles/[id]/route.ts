import { type NextRequest, NextResponse } from "next/server"
import { VehicleService } from "@/lib/services/vehicle-service"
import { requireAuth } from "@/lib/auth-middleware"

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authHeader = request.headers.get("authorization")
    console.log("[v0] PUT auth header present:", !!authHeader)
    if (authHeader) {
      const token = authHeader.substring(7)
      console.log("[v0] Token first 30 chars:", token.substring(0, 30))
    }

    const authCheck = requireAuth(request)
    if (!authCheck.isValid) {
      console.log("[v0] PUT auth failed")
      return authCheck.response!
    }

    const { id } = await params
    console.log("[v0] PUT request for ID:", id, "userId:", authCheck.user?.userId)

    if (!id || id.trim() === "") {
      return NextResponse.json({ error: "ID không hợp lệ" }, { status: 400 })
    }

    const body = await request.json()
    console.log("[v0] Update data:", body)

    const updated = await VehicleService.updateVehicle(id, body, authCheck.user?.userId)
    if (!updated) {
      console.warn("[v0] Vehicle not found for update:", id)
      return NextResponse.json({ error: "Không tìm thấy xe" }, { status: 404 })
    }

    return NextResponse.json(updated)
  } catch (error) {
    console.error("[v0] PUT /api/vehicles/[id] error:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Lỗi khi cập nhật xe" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authHeader = request.headers.get("authorization")
    console.log("[v0] DELETE auth header present:", !!authHeader)
    if (authHeader) {
      const token = authHeader.substring(7)
      console.log("[v0] DELETE token first 30 chars:", token.substring(0, 30))
    }

    const authCheck = requireAuth(request)
    if (!authCheck.isValid) {
      console.log("[v0] DELETE auth failed")
      return authCheck.response!
    }

    const { id } = await params
    console.log("[v0] DELETE request for ID:", id)

    if (!id || id.trim() === "") {
      return NextResponse.json({ error: "ID không hợp lệ" }, { status: 400 })
    }

    const deleted = await VehicleService.deleteVehicle(id)
    if (!deleted) {
      console.warn("[v0] Vehicle not found for delete:", id)
      return NextResponse.json({ error: "Không tìm thấy xe" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] DELETE /api/vehicles/[id] error:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Lỗi khi xóa xe" }, { status: 500 })
  }
}

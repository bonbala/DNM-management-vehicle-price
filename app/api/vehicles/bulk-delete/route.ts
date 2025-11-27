import { type NextRequest, NextResponse } from "next/server"
import { VehicleService } from "@/lib/services/vehicle-service"
import { requireAuth } from "@/lib/auth-middleware"

export async function DELETE(request: NextRequest) {
  const authCheck = requireAuth(request)
  if (!authCheck.isValid) {
    return authCheck.response!
  }

  try {
    const body = await request.json()
    const { ids } = body

    if (!Array.isArray(ids)) {
      return NextResponse.json({ error: "IDs phải là một mảng" }, { status: 400 })
    }

    const deletedCount = await VehicleService.deleteMultipleVehicles(ids)
    return NextResponse.json({ deletedCount })
  } catch (error) {
    console.error("[v0] DELETE /api/vehicles/bulk-delete error:", error)
    return NextResponse.json({ error: "Lỗi khi xóa hàng loạt" }, { status: 500 })
  }
}

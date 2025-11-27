import { type NextRequest, NextResponse } from "next/server"
import { VehicleService } from "@/lib/services/vehicle-service"
import { requireAuth } from "@/lib/auth-middleware"

export async function PUT(request: NextRequest) {
  const authCheck = requireAuth(request)
  if (!authCheck.isValid) {
    return authCheck.response!
  }

  try {
    const body = await request.json()
    const { updates } = body

    if (!Array.isArray(updates)) {
      return NextResponse.json({ error: "Updates phải là một mảng" }, { status: 400 })
    }

    const results = await VehicleService.updateMultipleVehicles(updates, authCheck.user?.userId)
    return NextResponse.json(results)
  } catch (error) {
    console.error("[v0] PUT /api/vehicles/bulk-update error:", error)
    return NextResponse.json({ error: "Lỗi khi cập nhật hàng loạt" }, { status: 500 })
  }
}

import { type NextRequest, NextResponse } from "next/server"
import { VehicleService } from "@/lib/services/vehicle-service"
import { requireAuth } from "@/lib/auth-middleware"

export async function GET() {
  try {
    const vehicles = await VehicleService.getAllVehicles()
    return NextResponse.json(vehicles)
  } catch (error) {
    console.error("[v0] GET /api/vehicles error:", error)
    return NextResponse.json({ error: "Lỗi khi lấy dữ liệu xe" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const authCheck = requireAuth(request)
  if (!authCheck.isValid) {
    return authCheck.response!
  }

  try {
    const body = await request.json()
    const { vehicles } = body

    if (Array.isArray(vehicles) && vehicles.length > 0) {
      const created = await VehicleService.createMultipleVehicles(vehicles)
      return NextResponse.json(created, { status: 201 })
    } else if (vehicles) {
      const created = await VehicleService.createVehicle(vehicles)
      return NextResponse.json(created, { status: 201 })
    }

    return NextResponse.json({ error: "Dữ liệu không hợp lệ" }, { status: 400 })
  } catch (error) {
    console.error("[v0] POST /api/vehicles error:", error)
    return NextResponse.json({ error: "Lỗi khi tạo xe mới" }, { status: 500 })
  }
}

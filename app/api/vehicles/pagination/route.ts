import { NextRequest, NextResponse } from "next/server"
import { VehicleService } from "@/lib/services/vehicle-service"

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams

    const page = Number(searchParams.get("page")) || 1
    const limit = Number(searchParams.get("limit")) || 10
    const brand = searchParams.get("brand") || undefined
    const type = searchParams.get("type") || undefined
    const year = searchParams.get("year") || undefined
    const engineCapacity = searchParams.get("engineCapacity") || undefined
    const sortBy = (searchParams.get("sortBy") as "default" | "nameAsc" | "nameDesc" | undefined) || undefined
    const search = searchParams.get("search") || undefined

    const result = await VehicleService.getVehiclesPagination({
      page,
      limit,
      brand,
      type,
      year,
      engineCapacity,
      sortBy,
      search,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("[v0] GET /api/vehicles/pagination error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

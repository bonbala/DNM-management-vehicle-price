import { type NextRequest, NextResponse } from "next/server"
import { HistoryService } from "@/lib/services/history-service"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const brand = searchParams.get("brand") || undefined
    const type = searchParams.get("type") || undefined
    const year = searchParams.get("year") || undefined
    const engineCapacity = searchParams.get("engineCapacity") || undefined
    const sortBy = (searchParams.get("sortBy") || "createdAt") as "createdAt" | "nameAsc" | "nameDesc"

    const result = await HistoryService.getHistoriesPagination({
      page,
      limit,
      brand,
      type,
      year,
      engineCapacity,
      sortBy,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("[v0] GET /api/histories/pagination error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Lỗi khi lấy dữ liệu lịch sử" },
      { status: 500 },
    )
  }
}

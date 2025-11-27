import { type NextRequest, NextResponse } from "next/server"
import { HistoryService } from "@/lib/services/history-service"

export async function GET(request: NextRequest, { params }: { params: Promise<{ vehicleId: string }> }) {
  try {
    const { vehicleId } = await params

    if (!vehicleId) {
      return NextResponse.json({ error: "Vehicle ID không hợp lệ" }, { status: 400 })
    }

    const histories = await HistoryService.getHistoriesByVehicleId(vehicleId)
    return NextResponse.json(histories)
  } catch (error) {
    console.error("[v0] GET /api/histories/[vehicleId] error:", error)
    return NextResponse.json({ error: "Lỗi khi lấy lịch sử thay đổi" }, { status: 500 })
  }
}

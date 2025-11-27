import { type NextRequest, NextResponse } from "next/server"
import { HistoryService } from "@/lib/services/history-service"
import { requireAuth } from "@/lib/auth-middleware"

export async function GET(request: NextRequest) {
  try {
    const histories = await HistoryService.getAllHistories()
    return NextResponse.json(histories)
  } catch (error) {
    console.error("[v0] GET /api/histories error:", error)
    return NextResponse.json({ error: "Lỗi khi lấy lịch sử thay đổi" }, { status: 500 })
  }
}

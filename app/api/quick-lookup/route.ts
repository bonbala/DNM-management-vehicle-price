import { type NextRequest, NextResponse } from "next/server"
import { ViolationContractService } from "@/lib/services/violation-contract-service"
import { AssetService } from "@/lib/services/asset-service"
import { requireAuth } from "@/lib/auth-middleware"

export async function GET(request: NextRequest) {
  const authCheck = requireAuth(request)
  if (!authCheck.isValid) return authCheck.response!

  const { searchParams } = new URL(request.url)
  const type = searchParams.get("type")
  const q = searchParams.get("q")?.trim()

  if (!q) {
    return NextResponse.json({ error: "Thiếu từ khóa tìm kiếm" }, { status: 400 })
  }

  try {
    if (type === "violation") {
      const result = await ViolationContractService.findByCustomerId(q)
      return NextResponse.json({ data: result })
    }

    if (type === "asset") {
      const result = await AssetService.findByPlateOrVin(q)
      return NextResponse.json({ data: result })
    }

    return NextResponse.json({ error: "Loại tra cứu không hợp lệ" }, { status: 400 })
  } catch (error) {
    console.error("[quick-lookup] error:", error)
    return NextResponse.json({ error: "Lỗi khi tra cứu" }, { status: 500 })
  }
}

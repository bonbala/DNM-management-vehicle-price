import { type NextRequest, NextResponse } from "next/server"
import { ViolationContractService } from "@/lib/services/violation-contract-service"
import { requireAuth } from "@/lib/auth-middleware"

export async function GET(request: NextRequest) {
  const authCheck = requireAuth(request)
  if (!authCheck.isValid) return authCheck.response!

  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get("page") || "1")
  const limit = parseInt(searchParams.get("limit") || "10")
  const search = searchParams.get("search") || undefined

  try {
    const result = await ViolationContractService.getPaginated(page, limit, search)
    return NextResponse.json(result)
  } catch (error) {
    console.error("[hdvp] GET error:", error)
    return NextResponse.json({ error: "Lỗi khi lấy danh sách hợp đồng vi phạm" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const authCheck = requireAuth(request, ["admin", "super_admin"])
  if (!authCheck.isValid) return authCheck.response!

  try {
    const body = await request.json()
    const contract = await ViolationContractService.create(body, authCheck.user!.username)
    return NextResponse.json(contract, { status: 201 })
  } catch (error) {
    console.error("[hdvp] POST error:", error)
    const message = error instanceof Error ? error.message : "Lỗi khi tạo dữ liệu vi phạm"
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

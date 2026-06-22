import { type NextRequest, NextResponse } from "next/server"
import { AssetService } from "@/lib/services/asset-service"
import { requireAuth } from "@/lib/auth-middleware"

export async function GET(request: NextRequest) {
  const authCheck = requireAuth(request)
  if (!authCheck.isValid) return authCheck.response!

  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get("page") || "1")
  const limit = parseInt(searchParams.get("limit") || "10")
  const search = searchParams.get("search") || undefined

  try {
    const result = await AssetService.getPaginated(page, limit, search)
    return NextResponse.json(result)
  } catch (error) {
    console.error("[qlts] GET error:", error)
    return NextResponse.json({ error: "Lỗi khi lấy danh sách tài sản" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const authCheck = requireAuth(request, ["admin", "super_admin","user"])
  if (!authCheck.isValid) return authCheck.response!

  try {
    const body = await request.json()
    const asset = await AssetService.create(body, authCheck.user!.userId, authCheck.user!.username)
    return NextResponse.json(asset, { status: 201 })
  } catch (error) {
    console.error("[qlts] POST error:", error)
    const message = error instanceof Error ? error.message : "Lỗi khi tạo tài sản"
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

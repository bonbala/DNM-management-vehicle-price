import { type NextRequest, NextResponse } from "next/server"
import { AuditLogService } from "@/lib/services/audit-log-service"
import { requireAuth } from "@/lib/auth-middleware"

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    // Check auth - only super_admin can view all user logs
    const authCheck = requireAuth(request, ["super_admin"])
    if (!authCheck.isValid || authCheck.response) {
      return authCheck.response || NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = params.userId
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1", 10)
    const limit = parseInt(searchParams.get("limit") || "50", 10)

    const result = await AuditLogService.getUserLogs(userId, page, limit)

    return NextResponse.json(result)
  } catch (error) {
    console.error("[v0] Failed to fetch user audit logs:", error)
    return NextResponse.json(
      { error: "Lỗi khi lấy dữ liệu audit log của user" },
      { status: 500 }
    )
  }
}

import { type NextRequest, NextResponse } from "next/server"
import { AuditLogService } from "@/lib/services/audit-log-service"
import { requireAuth } from "@/lib/auth-middleware"

export async function GET(request: NextRequest) {
  try {
    // Check auth - only super_admin can view logs
    const authCheck = requireAuth(request, ["super_admin"])
    if (!authCheck.isValid || authCheck.response) {
      return authCheck.response || NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1", 10)
    const limit = parseInt(searchParams.get("limit") || "50", 10)

    const result = await AuditLogService.getAllLogs(page, limit)

    return NextResponse.json(result)
  } catch (error) {
    console.error("[v0] Failed to fetch audit logs:", error)
    return NextResponse.json(
      { error: "Lỗi khi lấy dữ liệu audit log" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // This endpoint is called internally from login route
    const body = await request.json()

    const log = await AuditLogService.createLog({
      userId: body.userId,
      username: body.username,
      action: body.action,
      ipAddress: body.ipAddress,
      userAgent: body.userAgent,
      geolocation: body.geolocation,
      failureReason: body.failureReason,
      details: body.details,
    })

    return NextResponse.json(log, { status: 201 })
  } catch (error) {
    console.error("[v0] Failed to create audit log:", error)
    return NextResponse.json(
      { error: "Lỗi khi tạo audit log" },
      { status: 500 }
    )
  }
}

import { type NextRequest, NextResponse } from "next/server"
import { UserService } from "@/lib/services/user-service"
import { AuditLogService } from "@/lib/services/audit-log-service"
import { generateAccessToken, generateRefreshToken, getAccessTokenExpiry, getRefreshTokenExpiry } from "@/lib/jwt-utils"
import { checkRateLimit, getRemainingAttempts, getResetTime } from "@/lib/rate-limiter"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    // Get IP for rate limiting
    const ip = request.ip || request.headers.get("x-forwarded-for") || "unknown"
    const identifier = `login:${ip}`

    // Check rate limit
    if (!checkRateLimit(identifier)) {
      const resetTime = getResetTime(identifier)
      return NextResponse.json(
        {
          error: `Quá nhiều lần thử đăng nhập. Vui lòng thử lại sau ${resetTime} giây`,
          remainingAttempts: 0,
        },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { username, password } = body

    if (!username || !password) {
      return NextResponse.json(
        { error: "Tài khoản và mật khẩu không được để trống" },
        { status: 400 }
      )
    }

    // Authenticate user
    const user = await UserService.authenticateUser(username, password)

    if (!user) {
      const remaining = getRemainingAttempts(identifier)
      
      // Create failed login audit log
      try {
        await AuditLogService.createLog({
          userId: "unknown",
          username: username,
          action: "LOGIN_FAILED",
          ipAddress: ip,
          userAgent: request.headers.get("user-agent") || "",
          failureReason: "Invalid credentials",
          geolocation: body.geolocation,
        })
      } catch (auditError) {
        console.error("[v0] Failed to create audit log:", auditError)
      }
      
      return NextResponse.json(
        {
          error: "Tài khoản hoặc mật khẩu không chính xác",
          remainingAttempts: remaining,
          warning: remaining <= 2 ? `Còn ${remaining} lần thử trước khi bị khóa 15 phút` : undefined,
        },
        { status: 401 }
      )
    }

    // Generate access token (15 minutes)
    const accessToken = generateAccessToken(user.id, user.username, user.role)
    // Generate refresh token (7 days)
    const refreshToken = generateRefreshToken(user.id, user.username, user.role)

    const accessTokenExpiry = getAccessTokenExpiry()
    const refreshTokenExpiry = getRefreshTokenExpiry()

    const response = NextResponse.json(
      {
        user,
        accessToken,
        accessTokenExpiry,
        refreshToken,
        refreshTokenExpiry,
        expiresIn: "15m",
      },
      { status: 200 }
    )

    // Set access token as HttpOnly cookie
    response.cookies.set({
      name: "accessToken",
      value: accessToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 15 * 60, // 15 minutes in seconds
    })

    // Set refresh token as HttpOnly cookie
    response.cookies.set({
      name: "refreshToken",
      value: refreshToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
    })

    // Create successful login audit log
    try {
      await AuditLogService.createLog({
        userId: user.id,
        username: user.username,
        action: "LOGIN_SUCCESS",
        ipAddress: ip,
        userAgent: request.headers.get("user-agent") || "",
        geolocation: body.geolocation,
      })
    } catch (auditError) {
      console.error("[v0] Failed to create audit log:", auditError)
    }

    return response
  } catch (error) {
    console.error("[v0] POST /api/auth/login error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Lỗi khi đăng nhập" },
      { status: 500 }
    )
  }
}

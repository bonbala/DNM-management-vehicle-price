import jwt from "jsonwebtoken"
import type { UserRole } from "@/types/user"

export interface JWTPayload {
  userId: string
  username: string
  role: UserRole
  iat?: number
  exp?: number
}

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production"
const REFRESH_SECRET = process.env.REFRESH_SECRET || "your-refresh-secret-key-change-in-production"

// Access token: 15 minutes
const ACCESS_TOKEN_EXPIRY = "15m"
// Refresh token: 7 days
const REFRESH_TOKEN_EXPIRY = "7d"

/**
 * Generate JWT access token (short-lived)
 */
export function generateAccessToken(
  userId: string,
  username: string,
  role: UserRole
): string {
  const payload: JWTPayload = {
    userId,
    username,
    role,
  }

  const token = jwt.sign(payload, JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
    algorithm: "HS256",
  })

  return token
}

/**
 * Generate JWT refresh token (long-lived)
 */
export function generateRefreshToken(
  userId: string,
  username: string,
  role: UserRole
): string {
  const payload: JWTPayload = {
    userId,
    username,
    role,
  }

  const token = jwt.sign(payload, REFRESH_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY,
    algorithm: "HS256",
  })

  return token
}

/**
 * Verify and decode JWT access token
 */
export function verifyAccessToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      algorithms: ["HS256"],
    }) as JWTPayload

    return decoded
  } catch (error) {
    console.error("[v0] Access token verification error:", error instanceof Error ? error.message : String(error))
    return null
  }
}

/**
 * Verify and decode JWT refresh token
 */
export function verifyRefreshToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, REFRESH_SECRET, {
      algorithms: ["HS256"],
    }) as JWTPayload

    return decoded
  } catch (error) {
    console.error("[v0] Refresh token verification error:", error instanceof Error ? error.message : String(error))
    return null
  }
}

/**
 * Get access token expiry timestamp (15 minutes)
 */
export function getAccessTokenExpiry(): number {
  return Date.now() + 15 * 60 * 1000
}

/**
 * Get refresh token expiry timestamp (7 days)
 */
export function getRefreshTokenExpiry(): number {
  return Date.now() + 7 * 24 * 60 * 60 * 1000
}

/**
 * Check if token is expired (local check without verification)
 */
export function isTokenExpired(expiryTimestamp: number): boolean {
  return Date.now() > expiryTimestamp
}

/**
 * Legacy function - now calls generateAccessToken
 */
export function generateToken(
  userId: string,
  username: string,
  role: UserRole
): string {
  return generateAccessToken(userId, username, role)
}

/**
 * Legacy function - now calls verifyAccessToken
 */
export function verifyToken(token: string): JWTPayload | null {
  return verifyAccessToken(token)
}

/**
 * Legacy function - now calls getAccessTokenExpiry
 */
export function getTokenExpiry(): number {
  return getAccessTokenExpiry()
}

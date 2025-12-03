/**
 * Simple in-memory rate limiter for login attempts
 * In production, use Redis-based rate limiter (Upstash, etc.)
 */

interface RateLimitEntry {
  count: number
  resetTime: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

const ATTEMPTS_LIMIT = 5
const WINDOW_MS = 15 * 60 * 1000 // 15 minutes

/**
 * Check if IP/username exceeded rate limit
 * Returns true if request is allowed, false if rate limited
 */
export function checkRateLimit(identifier: string): boolean {
  const now = Date.now()
  const entry = rateLimitStore.get(identifier)

  if (!entry || now > entry.resetTime) {
    // Create new entry or reset
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + WINDOW_MS,
    })
    return true // Allow this request
  }

  // Check if limit exceeded
  if (entry.count >= ATTEMPTS_LIMIT) {
    console.warn(`[v0] Rate limit exceeded for: ${identifier}`)
    return false // Deny this request
  }

  // Increment counter
  entry.count++
  return true // Allow this request
}

/**
 * Get remaining attempts for identifier
 */
export function getRemainingAttempts(identifier: string): number {
  const entry = rateLimitStore.get(identifier)
  
  if (!entry || Date.now() > entry.resetTime) {
    return ATTEMPTS_LIMIT
  }

  return Math.max(0, ATTEMPTS_LIMIT - entry.count)
}

/**
 * Get reset time in seconds
 */
export function getResetTime(identifier: string): number {
  const entry = rateLimitStore.get(identifier)
  
  if (!entry) {
    return 0
  }

  const remaining = entry.resetTime - Date.now()
  return Math.max(0, Math.ceil(remaining / 1000))
}

/**
 * Reset rate limit for identifier (for testing)
 */
export function resetRateLimit(identifier: string): void {
  rateLimitStore.delete(identifier)
}

/**
 * Clean up old entries (call periodically)
 */
export function cleanupOldEntries(): void {
  const now = Date.now()
  let count = 0

  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key)
      count++
    }
  }

  if (count > 0) {
    console.log(`[v0] Cleaned up ${count} rate limit entries`)
  }
}

// Cleanup old entries every 5 minutes
setInterval(cleanupOldEntries, 5 * 60 * 1000)

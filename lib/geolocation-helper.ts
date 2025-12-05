import type { GeolocationCoordinates } from "@/types/audit-log"

export class GeolocationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "GeolocationError"
  }
}

/**
 * Request geolocation permission and get user coordinates
 * Throws GeolocationError if permission denied or geolocation not available
 */
export async function requestGeolocation(): Promise<GeolocationCoordinates> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new GeolocationError("Trình duyệt không hỗ trợ Geolocation"))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords
        resolve({
          latitude,
          longitude,
          accuracy,
        })
      },
      (error) => {
        console.warn("Geolocation error:", error.message, "code:", error.code)
        
        // Handle different error codes
        switch (error.code) {
          case error.PERMISSION_DENIED:
            reject(new GeolocationError("Cấp quyền truy cập location bị từ chối"))
            break
          case error.POSITION_UNAVAILABLE:
            reject(new GeolocationError("Không thể xác định vị trí"))
            break
          case error.TIMEOUT:
            reject(new GeolocationError("Yêu cầu xác định vị trí hết thời gian"))
            break
          default:
            reject(new GeolocationError("Lỗi xác định vị trí: " + error.message))
        }
      },
      {
        timeout: 10000, // 10 seconds timeout
        maximumAge: 0, // Don't use cached position
        enableHighAccuracy: false, // Don't need high accuracy
      }
    )
  })
}

/**
 * Format geolocation for display
 */
export function formatGeolocation(geo: GeolocationCoordinates | undefined): string {
  if (!geo) return "N/A"
  return `${geo.latitude.toFixed(4)}, ${geo.longitude.toFixed(4)} (±${Math.round(geo.accuracy)}m)`
}

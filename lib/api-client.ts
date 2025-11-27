import type { Vehicle } from "@/types/vehicle"

export interface VehiclePaginationParams {
  page: number
  limit: number
  brand?: string
  type?: string
  year?: string
  engineCapacity?: string
  sortBy?: "default" | "nameAsc" | "nameDesc"
  search?: string
}

export interface VehiclePaginationResult {
  data: Vehicle[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export class VehicleAPI {
  private static getAuthHeader(): Record<string, string> {
    // Get token from localStorage instead of hardcoded value
    if (typeof window === "undefined") {
      console.log("[v0] Running on server side, no token available")
      return {}
    }

    const token = localStorage.getItem("token")
    
    if (!token) {
      console.warn("[v0] No token found in localStorage")
      return {}
    }

    console.log("[v0] Found token in localStorage, first 30 chars:", token.substring(0, 30))
    return {
      Authorization: `Bearer ${token}`,
    }
  }

  static async getAllVehicles(): Promise<Vehicle[]> {
    const res = await fetch("/api/vehicles")
    if (!res.ok) throw new Error("Lỗi khi lấy dữ liệu xe")
    return res.json()
  }

  static async getVehiclesPagination(params: VehiclePaginationParams): Promise<VehiclePaginationResult> {
    const queryParams = new URLSearchParams()
    queryParams.set("page", params.page.toString())
    queryParams.set("limit", params.limit.toString())
    if (params.brand) queryParams.set("brand", params.brand)
    if (params.type) queryParams.set("type", params.type)
    if (params.year) queryParams.set("year", params.year)
    if (params.engineCapacity) queryParams.set("engineCapacity", params.engineCapacity)
    if (params.sortBy) queryParams.set("sortBy", params.sortBy)
    if (params.search) queryParams.set("search", params.search)

    const res = await fetch(`/api/vehicles/pagination?${queryParams.toString()}`)
    if (!res.ok) throw new Error("Lỗi khi lấy dữ liệu xe")
    return res.json()
  }

  static async createVehicle(vehicle: Omit<Vehicle, "id">): Promise<Vehicle> {
    const authHeader = this.getAuthHeader()
    const res = await fetch("/api/vehicles", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(Object.keys(authHeader).length > 0 && authHeader),
      },
      body: JSON.stringify({ vehicles: vehicle }),
    })
    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.error || "Lỗi khi tạo xe mới")
    }
    return res.json()
  }

  static async createMultipleVehicles(vehicles: Omit<Vehicle, "id">[]): Promise<Vehicle[]> {
    const authHeader = this.getAuthHeader()
    const res = await fetch("/api/vehicles", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(Object.keys(authHeader).length > 0 && authHeader),
      },
      body: JSON.stringify({ vehicles }),
    })
    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.error || "Lỗi khi tạo nhiều xe")
    }
    return res.json()
  }

  static async updateVehicle(id: string, updates: Partial<Omit<Vehicle, "id">>): Promise<Vehicle> {
    const authHeader = this.getAuthHeader()
    const res = await fetch(`/api/vehicles/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(Object.keys(authHeader).length > 0 && authHeader),
      },
      body: JSON.stringify(updates),
    })
    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.error || "Lỗi khi cập nhật xe")
    }
    return res.json()
  }

  static async updateMultipleVehicles(
    updates: Array<{ id: string; data: Partial<Omit<Vehicle, "id">> }>,
  ): Promise<Vehicle[]> {
    const authHeader = this.getAuthHeader()
    const res = await fetch("/api/vehicles/bulk-update", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(Object.keys(authHeader).length > 0 && authHeader),
      },
      body: JSON.stringify({ updates }),
    })
    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.error || "Lỗi khi cập nhật hàng loạt")
    }
    return res.json()
  }

  static async deleteVehicle(id: string): Promise<void> {
    const authHeader = this.getAuthHeader()
    const res = await fetch(`/api/vehicles/${id}`, {
      method: "DELETE",
      headers: Object.keys(authHeader).length > 0 ? authHeader : {},
    })
    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.error || "Lỗi khi xóa xe")
    }
  }

  static async deleteMultipleVehicles(ids: string[]): Promise<number> {
    const authHeader = this.getAuthHeader()
    const res = await fetch("/api/vehicles/bulk-delete", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...(Object.keys(authHeader).length > 0 && authHeader),
      },
      body: JSON.stringify({ ids }),
    })
    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.error || "Lỗi khi xóa hàng loạt")
    }
    const data = await res.json()
    return data.deletedCount
  }
}


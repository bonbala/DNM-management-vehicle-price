import type { Vehicle } from "@/types/vehicle"
import { getVehiclesCollection } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { HistoryService } from "./history-service"

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

export class VehicleService {
  static async getAllVehicles(): Promise<Vehicle[]> {
    const collection = await getVehiclesCollection()
    const vehicles = await collection.find({}).toArray()
    return vehicles.map((doc) => ({
      id: doc._id.toString(),
      name: doc.name,
      brand: doc.brand,
      type: doc.type,
      year: doc.year,
      engineCapacity: doc.engineCapacity,
      salePrice: doc.salePrice,
      buyPrice: doc.buyPrice || 0,
    }))
  }

  static buildVehicleFilter(params: Partial<VehiclePaginationParams>) {
    const filter: Record<string, any> = {}

    if (params.brand) {
      filter.brand = params.brand
    }
    if (params.type) {
      filter.type = params.type
    }
    if (params.year) {
      filter.year = Number(params.year)
    }
    if (params.engineCapacity) {
      filter.engineCapacity = params.engineCapacity
    }
    if (params.search) {
      filter.$or = [
        { name: { $regex: params.search, $options: "i" } },
        { brand: { $regex: params.search, $options: "i" } },
      ]
    }

    return filter
  }

  static async getVehiclesPagination(params: VehiclePaginationParams): Promise<VehiclePaginationResult> {
    const collection = await getVehiclesCollection()

    const filter = this.buildVehicleFilter(params)

    // Get total count
    const total = await collection.countDocuments(filter)

    // Determine sort order
    let sortOrder: Record<string, 1 | -1> = { _id: -1 }
    if (params.sortBy === "nameAsc") {
      sortOrder = { name: 1 }
    } else if (params.sortBy === "nameDesc") {
      sortOrder = { name: -1 }
    } else if (params.sortBy === "default") {
      sortOrder = { _id: -1 }
    }

    // Calculate pagination
    const skip = (params.page - 1) * params.limit
    const totalPages = Math.ceil(total / params.limit)

    // Fetch paginated data
    const vehicles = await collection
      .find(filter)
      .sort(sortOrder)
      .skip(skip)
      .limit(params.limit)
      .toArray()

    return {
      data: vehicles.map((doc) => ({
        id: doc._id.toString(),
        name: doc.name,
        brand: doc.brand,
        type: doc.type,
        year: doc.year,
        engineCapacity: doc.engineCapacity,
        salePrice: doc.salePrice,
        buyPrice: doc.buyPrice || 0,
      })),
      total,
      page: params.page,
      limit: params.limit,
      totalPages,
    }
  }

  static async createVehicle(vehicle: Omit<Vehicle, "id">): Promise<Vehicle> {
    const collection = await getVehiclesCollection()
    const result = await collection.insertOne({
      ...vehicle,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    return {
      id: result.insertedId.toString(),
      ...vehicle,
    }
  }

  static async createMultipleVehicles(vehicles: Omit<Vehicle, "id">[]): Promise<Vehicle[]> {
    const collection = await getVehiclesCollection()
    const result = await collection.insertMany(
      vehicles.map((v) => ({
        ...v,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
    )
    return vehicles.map((v, index) => ({
      id: result.insertedIds[index].toString(),
      ...v,
    }))
  }

  static async updateVehicle(
    id: string,
    updates: Partial<Omit<Vehicle, "id">>,
    userId?: string,
  ): Promise<Vehicle | null> {
    try {
      if (!ObjectId.isValid(id)) {
        console.error("[v0] Invalid ObjectId format:", id)
        return null
      }

      const collection = await getVehiclesCollection()

      // Get old vehicle data for history
      const oldVehicle = await collection.findOne({ _id: new ObjectId(id) })

      const result = await collection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        {
          $set: {
            ...updates,
            updatedAt: new Date(),
          },
        },
        { returnDocument: "after" },
      )

      console.log("[v0] Update result:", result)
      if (!result) {
        console.error("[v0] Update result is null for id:", id)
        return null
      }

      const updatedDoc = result.value || result

      if (!updatedDoc || !updatedDoc._id) {
        console.error("[v0] Updated document missing _id:", updatedDoc)
        return null
      }

      // Create history record if price changed and userId provided
      if (
        userId &&
        oldVehicle &&
        (updates.salePrice !== undefined || updates.buyPrice !== undefined) &&
        (oldVehicle.salePrice !== updates.salePrice || oldVehicle.buyPrice !== updates.buyPrice)
      ) {
        await HistoryService.createHistory(
          id,
          oldVehicle.salePrice,
          updates.salePrice !== undefined ? updates.salePrice : oldVehicle.salePrice,
          userId,
          oldVehicle.buyPrice || 0,
          updates.buyPrice !== undefined ? updates.buyPrice : (oldVehicle.buyPrice || 0),
        )
      }

      return {
        id: updatedDoc._id.toString(),
        name: updatedDoc.name,
        brand: updatedDoc.brand,
        type: updatedDoc.type,
        year: updatedDoc.year,
        engineCapacity: updatedDoc.engineCapacity,
        salePrice: updatedDoc.salePrice,
        buyPrice: updatedDoc.buyPrice || 0,
      }
    } catch (error) {
      console.error("[v0] updateVehicle error:", error)
      throw error
    }
  }

  static async updateMultipleVehicles(
    updates: Array<{ id: string; data: Partial<Omit<Vehicle, "id">> }>,
    userId?: string,
  ): Promise<Vehicle[]> {
    const collection = await getVehiclesCollection()
    const results = []

    for (const { id, data } of updates) {
      try {
        if (!ObjectId.isValid(id)) {
          console.warn("[v0] Skipping invalid ObjectId:", id)
          continue
        }

        // Get old vehicle data for history
        const oldVehicle = await collection.findOne({ _id: new ObjectId(id) })

        const result = await collection.findOneAndUpdate(
          { _id: new ObjectId(id) },
          {
            $set: {
              ...data,
              updatedAt: new Date(),
            },
          },
          { returnDocument: "after" },
        )

        const updatedDoc = result?.value || result
        if (updatedDoc && updatedDoc._id) {
          // Create history record if price changed and userId provided
          if (
            userId &&
            oldVehicle &&
            (data.salePrice !== undefined || data.buyPrice !== undefined) &&
            (oldVehicle.salePrice !== data.salePrice || oldVehicle.buyPrice !== data.buyPrice)
          ) {
            await HistoryService.createHistory(
              id,
              oldVehicle.salePrice,
              data.salePrice !== undefined ? data.salePrice : oldVehicle.salePrice,
              userId,
              oldVehicle.buyPrice || 0,
              data.buyPrice !== undefined ? data.buyPrice : (oldVehicle.buyPrice || 0),
            )
          }

          results.push({
            id: updatedDoc._id.toString(),
            name: updatedDoc.name,
            brand: updatedDoc.brand,
            type: updatedDoc.type,
            year: updatedDoc.year,
            engineCapacity: updatedDoc.engineCapacity,
            salePrice: updatedDoc.salePrice,
            buyPrice: updatedDoc.buyPrice || 0,
          })
        }
      } catch (error) {
        console.error("[v0] Error updating vehicle:", id, error)
      }
    }

    return results
  }

  static async deleteVehicle(id: string): Promise<boolean> {
    try {
      if (!ObjectId.isValid(id)) {
        console.error("[v0] Invalid ObjectId format for delete:", id)
        return false
      }

      const collection = await getVehiclesCollection()
      const result = await collection.deleteOne({ _id: new ObjectId(id) })
      console.log("[v0] Delete result:", result)
      return result.deletedCount > 0
    } catch (error) {
      console.error("[v0] deleteVehicle error:", error)
      throw error
    }
  }

  static async deleteMultipleVehicles(ids: string[]): Promise<number> {
    try {
      const validIds = ids.filter((id) => ObjectId.isValid(id))
      console.log("[v0] Valid IDs for bulk delete:", validIds)

      if (validIds.length === 0) {
        console.warn("[v0] No valid IDs to delete")
        return 0
      }

      const collection = await getVehiclesCollection()
      const result = await collection.deleteMany({
        _id: { $in: validIds.map((id) => new ObjectId(id)) },
      })
      console.log("[v0] Bulk delete result:", result)
      return result.deletedCount || 0
    } catch (error) {
      console.error("[v0] deleteMultipleVehicles error:", error)
      throw error
    }
  }
}

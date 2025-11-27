import type { History, HistoryDisplay, HistoryPaginationParams, HistoryPaginationResult } from "@/types/history"
import { getHistoriesCollection } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

interface HistoryDocument {
  _id: ObjectId
  vehicleId: string
  oldPrice: number
  newPrice: number
  userId: string
  createdAt: Date
}

export class HistoryService {
  private static mapDocToHistory(doc: HistoryDocument): History {
    return {
      id: doc._id.toString(),
      vehicleId: doc.vehicleId,
      oldPrice: doc.oldPrice,
      newPrice: doc.newPrice,
      userId: doc.userId,
      createdAt: doc.createdAt,
    }
  }

  static async createHistory(
    vehicleId: string,
    oldPrice: number,
    newPrice: number,
    userId: string,
  ): Promise<History> {
    const collection = await getHistoriesCollection()
    const now = new Date()

    const result = await collection.insertOne({
      vehicleId,
      oldPrice,
      newPrice,
      userId,
      createdAt: now,
    })

    return {
      id: result.insertedId.toString(),
      vehicleId,
      oldPrice,
      newPrice,
      userId,
      createdAt: now,
    }
  }

  // Build aggregation pipeline with filters and sorting
  private static buildAggregationPipeline(params?: HistoryPaginationParams) {
    const pipeline: any[] = [
      {
        $lookup: {
          from: "vehicles",
          let: { vehicleId: "$vehicleId" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: [
                    { $toString: "$_id" },
                    "$$vehicleId"
                  ]
                }
              }
            }
          ],
          as: "vehicle",
        },
      },
      {
        $lookup: {
          from: "users",
          let: { userId: "$userId" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $or: [
                    { $eq: [{ $toString: "$_id" }, "$$userId"] },
                    { $eq: ["$_id", { $toObjectId: "$$userId" }] }
                  ]
                }
              }
            }
          ],
          as: "user",
        },
      },
      {
        $unwind: {
          path: "$vehicle",
          preserveNullAndEmptyArrays: false
        }
      },
      {
        $unwind: {
          path: "$user",
          preserveNullAndEmptyArrays: false
        }
      },
    ]

    // Add filters
    const matchStage: any = {}
    if (params?.brand) {
      matchStage["vehicle.brand"] = params.brand
    }
    if (params?.type) {
      matchStage["vehicle.type"] = params.type
    }
    if (params?.year) {
      matchStage["vehicle.year"] = parseInt(params.year)
    }
    if (params?.engineCapacity) {
      matchStage["vehicle.engineCapacity"] = params.engineCapacity
    }

    if (Object.keys(matchStage).length > 0) {
      pipeline.push({ $match: matchStage })
    }

    // Add sorting
    let sortStage: any = { createdAt: -1 }
    if (params?.sortBy === "nameAsc") {
      sortStage = { "vehicle.name": 1 }
    } else if (params?.sortBy === "nameDesc") {
      sortStage = { "vehicle.name": -1 }
    } else if (params?.sortBy === "createdAt") {
      sortStage = { createdAt: -1 }
    } else if (params?.sortBy === "createdAtOld") {
      sortStage = { createdAt: 1 }
    }

    pipeline.push({ $sort: sortStage })

    return pipeline
  }

  static async getAllHistories(): Promise<HistoryDisplay[]> {
    const collection = await getHistoriesCollection()

    const histories = await collection
      .aggregate(this.buildAggregationPipeline())
      .toArray()

    return histories.map((doc: any) => ({
      id: doc._id.toString(),
      vehicleId: doc.vehicleId,
      nameVehicle: doc.vehicle.name,
      brand: doc.vehicle.brand,
      type: doc.vehicle.type,
      year: doc.vehicle.year,
      engineCapacity: doc.vehicle.engineCapacity,
      oldPrice: doc.oldPrice,
      newPrice: doc.newPrice,
      staffName: doc.user.staffName,
      createdAt: doc.createdAt,
    }))
  }

  static async getHistoriesByVehicleId(vehicleId: string): Promise<HistoryDisplay[]> {
    const collection = await getHistoriesCollection()

    const histories = await collection
      .aggregate([
        {
          $match: {
            vehicleId: vehicleId,
          },
        },
        ...this.buildAggregationPipeline(),
      ])
      .toArray()

    return histories.map((doc: any) => ({
      id: doc._id.toString(),
      vehicleId: doc.vehicleId,
      nameVehicle: doc.vehicle.name,
      brand: doc.vehicle.brand,
      type: doc.vehicle.type,
      year: doc.vehicle.year,
      engineCapacity: doc.vehicle.engineCapacity,
      oldPrice: doc.oldPrice,
      newPrice: doc.newPrice,
      staffName: doc.user.staffName,
      createdAt: doc.createdAt,
    }))
  }

  static async getHistoriesPagination(params: HistoryPaginationParams): Promise<HistoryPaginationResult> {
    const collection = await getHistoriesCollection()
    const page = params.page || 1
    const limit = params.limit || 10
    const skip = (page - 1) * limit

    // Build aggregation pipeline
    const pipeline = this.buildAggregationPipeline(params)

    // Count total documents
    const countPipeline = [...pipeline]
    const countResult = await collection
      .aggregate([...countPipeline, { $count: "total" }])
      .toArray()

    const total = countResult.length > 0 ? countResult[0].total : 0

    // Get paginated data
    const dataResult = await collection
      .aggregate([
        ...pipeline,
        { $skip: skip },
        { $limit: limit },
      ])
      .toArray()

    const data = dataResult.map((doc: any) => ({
      id: doc._id.toString(),
      vehicleId: doc.vehicleId,
      nameVehicle: doc.vehicle.name,
      brand: doc.vehicle.brand,
      type: doc.vehicle.type,
      year: doc.vehicle.year,
      engineCapacity: doc.vehicle.engineCapacity,
      oldPrice: doc.oldPrice,
      newPrice: doc.newPrice,
      staffName: doc.user.staffName,
      createdAt: doc.createdAt,
    }))

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  }

  static async getHistoriesCount(): Promise<number> {
    const collection = await getHistoriesCollection()
    return await collection.countDocuments()
  }
}

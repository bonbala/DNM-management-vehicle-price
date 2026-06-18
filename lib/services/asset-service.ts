import type { Asset, CreateAssetDto } from "@/types/asset"
import { getAssetsCollection } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

let indexEnsured = false

async function getCollection() {
  const col = await getAssetsCollection()
  if (!indexEnsured) {
    await col.createIndex(
      { plateNumber: 1 },
      { unique: true, partialFilterExpression: { plateNumber: { $gt: "" } } }
    )
    await col.createIndex(
      { vehicleIdNumber: 1 },
      { unique: true, partialFilterExpression: { vehicleIdNumber: { $gt: "" } } }
    )
    indexEnsured = true
  }
  return col
}

export class AssetService {
  static async getPaginated(page: number, limit: number, search?: string) {
    const col = await getCollection()
    const query = search
      ? {
          $or: [
            { vehicleName: { $regex: search, $options: "i" } },
            { plateNumber: { $regex: search, $options: "i" } },
            { vehicleIdNumber: { $regex: search, $options: "i" } },
            { customerName: { $regex: search, $options: "i" } },
          ],
        }
      : {}

    const total = await col.countDocuments(query)
    const docs = await col
      .find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray()

    return {
      data: docs.map(AssetService.toAsset),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  }

  static async findByPlateOrVin(query: string): Promise<Asset | null> {
    const col = await getCollection()
    const doc = await col.findOne({
      $or: [{ plateNumber: query }, { vehicleIdNumber: query }],
    })
    if (!doc) return null
    return AssetService.toAsset(doc)
  }

  static async getById(id: string): Promise<Asset | null> {
    const col = await getCollection()
    const doc = await col.findOne({ _id: new ObjectId(id) })
    if (!doc) return null
    return AssetService.toAsset(doc)
  }

  static async create(dto: CreateAssetDto, userId: string, createdBy: string): Promise<Asset> {
    const col = await getCollection()

    if (!dto.vehicleName?.trim()) throw new Error("Tên xe không được để trống")
    if (!dto.plateNumber?.trim()) throw new Error("Biển số xe không được để trống")
    if (!dto.vehicleIdNumber?.trim()) throw new Error("Số khung xe không được để trống")
    if (!dto.customerName?.trim()) throw new Error("Tên khách hàng không được để trống")

    const existingPlate = await col.findOne({ plateNumber: dto.plateNumber })
    if (existingPlate) {
      throw new Error(`Biển số xe "${dto.plateNumber}" đã tồn tại trong hệ thống`)
    }

    const existingVin = await col.findOne({ vehicleIdNumber: dto.vehicleIdNumber })
    if (existingVin) {
      throw new Error(`Số khung xe "${dto.vehicleIdNumber}" đã tồn tại trong hệ thống`)
    }

    const now = new Date()
    const result = await col.insertOne({
      ...dto,
      userId,
      createdBy,
      createdAt: now,
      updatedAt: now,
    })
    const doc = await col.findOne({ _id: result.insertedId })
    return AssetService.toAsset(doc!)
  }

  static async update(id: string, dto: Partial<CreateAssetDto>): Promise<Asset | null> {
    const col = await getCollection()

    if (dto.plateNumber) {
      const existingPlate = await col.findOne({
        plateNumber: dto.plateNumber,
        _id: { $ne: new ObjectId(id) },
      })
      if (existingPlate) {
        throw new Error(`Biển số xe "${dto.plateNumber}" đã tồn tại trong hệ thống`)
      }
    }

    if (dto.vehicleIdNumber) {
      const existingVin = await col.findOne({
        vehicleIdNumber: dto.vehicleIdNumber,
        _id: { $ne: new ObjectId(id) },
      })
      if (existingVin) {
        throw new Error(`Số khung xe "${dto.vehicleIdNumber}" đã tồn tại trong hệ thống`)
      }
    }

    const update: Record<string, unknown> = { ...dto, updatedAt: new Date() }
    await col.updateOne({ _id: new ObjectId(id) }, { $set: update })
    return AssetService.getById(id)
  }

  static async delete(id: string): Promise<boolean> {
    const col = await getCollection()
    const result = await col.deleteOne({ _id: new ObjectId(id) })
    return result.deletedCount === 1
  }

  private static toAsset(doc: Record<string, unknown>): Asset {
    return {
      id: (doc._id as ObjectId).toString(),
      vehicleName: doc.vehicleName as string,
      plateNumber: doc.plateNumber as string,
      vehicleIdNumber: doc.vehicleIdNumber as string,
      customerName: doc.customerName as string,
      userId: doc.userId as string,
      createdBy: doc.createdBy as string,
      note: doc.note as string | undefined,
      createdAt: doc.createdAt as Date,
      updatedAt: doc.updatedAt as Date,
    }
  }
}

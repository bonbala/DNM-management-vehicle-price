import type { ViolationContract, CreateViolationContractDto } from "@/types/violation-contract"
import { getViolationContractsCollection } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

let indexEnsured = false

async function getCollection() {
  const col = await getViolationContractsCollection()
  if (!indexEnsured) {
    // Drop stale indexes from previous schema iterations
    try { await col.dropIndex("customerName_1") } catch { /* not found, skip */ }
    try { await col.dropIndex("customerId_1") } catch { /* not found, skip */ }
    // Only enforce uniqueness on non-empty customerId values
    await col.createIndex(
      { customerId: 1 },
      { unique: true, partialFilterExpression: { customerId: { $gt: "" } } }
    )
    indexEnsured = true
  }
  return col
}

export class ViolationContractService {
  static async getAll(): Promise<ViolationContract[]> {
    const col = await getCollection()
    const docs = await col.find({}).sort({ createdAt: -1 }).toArray()
    return docs.map(ViolationContractService.toContract)
  }

  static async getPaginated(page: number, limit: number, search?: string) {
    const col = await getCollection()
    const query = search
      ? { customerId: { $regex: search, $options: "i" } }
      : {}

    const total = await col.countDocuments(query)
    const docs = await col
      .find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray()

    return {
      data: docs.map(ViolationContractService.toContract),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  }

  static async getById(id: string): Promise<ViolationContract | null> {
    const col = await getCollection()
    const doc = await col.findOne({ _id: new ObjectId(id) })
    if (!doc) return null
    return ViolationContractService.toContract(doc)
  }

  static async create(dto: CreateViolationContractDto, createdBy: string): Promise<ViolationContract> {
    const col = await getCollection()

    if (!dto.customerName?.trim()) throw new Error("Tên khách hàng không được để trống")
    if (!dto.customerId?.trim()) throw new Error("CMND/CCCD không được để trống")
    if (!dto.phoneNumber?.trim()) throw new Error("Số điện thoại không được để trống")

    const existing = await col.findOne({ customerId: dto.customerId })
    if (existing) {
      throw new Error(`CMND/CCCD "${dto.customerId}" đã tồn tại trong hệ thống`)
    }

    const now = new Date()
    const result = await col.insertOne({
      ...dto,
      violationDate: new Date(dto.violationDate),
      createdBy,
      createdAt: now,
      updatedAt: now,
    })
    const doc = await col.findOne({ _id: result.insertedId })
    return ViolationContractService.toContract(doc!)
  }

  static async update(id: string, dto: Partial<CreateViolationContractDto>): Promise<ViolationContract | null> {
    const col = await getCollection()

    if (dto.customerId) {
      const existing = await col.findOne({
        customerId: dto.customerId,
        _id: { $ne: new ObjectId(id) },
      })
      if (existing) {
        throw new Error(`CMND/CCCD "${dto.customerId}" đã tồn tại trong hệ thống`)
      }
    }

    const update: Record<string, unknown> = { ...dto, updatedAt: new Date() }
    if (dto.violationDate) update.violationDate = new Date(dto.violationDate)

    await col.updateOne({ _id: new ObjectId(id) }, { $set: update })
    return ViolationContractService.getById(id)
  }

  static async delete(id: string): Promise<boolean> {
    const col = await getCollection()
    const result = await col.deleteOne({ _id: new ObjectId(id) })
    return result.deletedCount === 1
  }

  private static toContract(doc: Record<string, unknown>): ViolationContract {
    return {
      id: (doc._id as ObjectId).toString(),
      customerName: doc.customerName as string,
      phoneNumber: doc.phoneNumber as string,
      customerId: doc.customerId as string,
      address: doc.address as string,
      vehicleName: doc.vehicleName as string,
      violationMoney: (doc.violationMoney as number) ?? 0,
      violationDate: doc.violationDate as Date,
      status: doc.status as ViolationContract["status"],
      notes: doc.notes as string | undefined,
      createdBy: doc.createdBy as string,
      createdAt: doc.createdAt as Date,
      updatedAt: doc.updatedAt as Date,
    }
  }
}

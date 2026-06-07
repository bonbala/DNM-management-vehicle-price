import type { ViolationContract, CreateViolationContractDto } from "@/types/violation-contract"
import { getViolationContractsCollection } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

let indexEnsured = false

async function getCollection() {
  const col = await getViolationContractsCollection()
  if (!indexEnsured) {
    await col.createIndex({ customerName: 1 }, { unique: true })
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
      ? {
          $or: [
            { customerName: { $regex: search, $options: "i" } },
            { phoneNumber: { $regex: search, $options: "i" } },
            { customerId: { $regex: search, $options: "i" } },
            { vehicleName: { $regex: search, $options: "i" } },
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

    const existing = await col.findOne({ customerName: dto.customerName })
    if (existing) {
      throw new Error(`Khách hàng "${dto.customerName}" đã tồn tại trong hệ thống`)
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

    if (dto.customerName) {
      const existing = await col.findOne({
        customerName: dto.customerName,
        _id: { $ne: new ObjectId(id) },
      })
      if (existing) {
        throw new Error(`Khách hàng "${dto.customerName}" đã tồn tại trong hệ thống`)
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
      violationDate: doc.violationDate as Date,
      status: doc.status as ViolationContract["status"],
      notes: doc.notes as string | undefined,
      createdBy: doc.createdBy as string,
      createdAt: doc.createdAt as Date,
      updatedAt: doc.updatedAt as Date,
    }
  }
}

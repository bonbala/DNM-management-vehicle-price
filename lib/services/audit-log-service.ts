import { getAuditLogsCollection } from "@/lib/mongodb"
import type { AuditLog, CreateAuditLogInput } from "@/types/audit-log"

export class AuditLogService {
  /**
   * Create new audit log entry
   */
  static async createLog(data: CreateAuditLogInput): Promise<AuditLog> {
    const collection = await getAuditLogsCollection()

    const auditLog = {
      ...data,
      timestamp: new Date(),
    }

    const result = await collection.insertOne(auditLog as any)

    return {
      id: result.insertedId.toString(),
      ...auditLog,
    } as AuditLog
  }

  /**
   * Get all audit logs (with pagination)
   */
  static async getAllLogs(page: number = 1, limit: number = 50): Promise<{
    data: AuditLog[]
    total: number
    page: number
    limit: number
    totalPages: number
  }> {
    const collection = await getAuditLogsCollection()

    const skip = (page - 1) * limit
    const total = await collection.countDocuments()
    const totalPages = Math.ceil(total / limit)

    const logs = await collection
      .find({})
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .toArray()

    return {
      data: logs.map((log: any) => ({
        id: log._id.toString(),
        userId: log.userId,
        username: log.username,
        action: log.action,
        ipAddress: log.ipAddress,
        userAgent: log.userAgent,
        timestamp: log.timestamp,
        geolocation: log.geolocation,
        failureReason: log.failureReason,
        details: log.details,
      })),
      total,
      page,
      limit,
      totalPages,
    }
  }

  /**
   * Get logs for specific user
   */
  static async getUserLogs(
    userId: string,
    page: number = 1,
    limit: number = 50
  ): Promise<{
    data: AuditLog[]
    total: number
    page: number
    limit: number
    totalPages: number
  }> {
    const collection = await getAuditLogsCollection()

    const skip = (page - 1) * limit
    const total = await collection.countDocuments({ userId })
    const totalPages = Math.ceil(total / limit)

    const logs = await collection
      .find({ userId })
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .toArray()

    return {
      data: logs.map((log: any) => ({
        id: log._id.toString(),
        userId: log.userId,
        username: log.username,
        action: log.action,
        ipAddress: log.ipAddress,
        userAgent: log.userAgent,
        timestamp: log.timestamp,
        geolocation: log.geolocation,
        failureReason: log.failureReason,
        details: log.details,
      })),
      total,
      page,
      limit,
      totalPages,
    }
  }

  /**
   * Get logs for specific action
   */
  static async getLogsByAction(
    action: string,
    page: number = 1,
    limit: number = 50
  ): Promise<{
    data: AuditLog[]
    total: number
    page: number
    limit: number
    totalPages: number
  }> {
    const collection = await getAuditLogsCollection()

    const skip = (page - 1) * limit
    const total = await collection.countDocuments({ action })
    const totalPages = Math.ceil(total / limit)

    const logs = await collection
      .find({ action })
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .toArray()

    return {
      data: logs.map((log: any) => ({
        id: log._id.toString(),
        userId: log.userId,
        username: log.username,
        action: log.action,
        ipAddress: log.ipAddress,
        userAgent: log.userAgent,
        timestamp: log.timestamp,
        geolocation: log.geolocation,
        failureReason: log.failureReason,
        details: log.details,
      })),
      total,
      page,
      limit,
      totalPages,
    }
  }

  /**
   * Delete old logs (older than specified days)
   */
  static async deleteOldLogs(daysOld: number = 90): Promise<number> {
    const collection = await getAuditLogsCollection()
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysOld)

    const result = await collection.deleteMany({
      timestamp: { $lt: cutoffDate },
    })

    return result.deletedCount
  }
}

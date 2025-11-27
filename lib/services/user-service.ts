import type { User, UserRole } from "@/types/user"
import { getUsersCollection } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import crypto from "crypto"

interface UserDocument {
  _id: ObjectId
  username: string
  staffName: string
  password: string
  role: UserRole
  createdAt: Date
  updatedAt: Date
}

export class UserService {
  // Hash password (simple implementation - use bcrypt in production)
  private static hashPassword(password: string): string {
    return crypto.createHash("sha256").update(password).digest("hex")
  }

  private static mapDocToUser(doc: UserDocument): User {
    return {
      id: doc._id.toString(),
      username: doc.username,
      staffName: doc.staffName,
      role: doc.role,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    }
  }

  static async getAllUsers(): Promise<User[]> {
    const collection = await getUsersCollection()
    const users = await collection.find({}).toArray()
    return users.map((doc: any) => this.mapDocToUser(doc as UserDocument))
  }

  static async getUserById(id: string): Promise<User | null> {
    if (!ObjectId.isValid(id)) {
      console.error("[v0] Invalid ObjectId format:", id)
      return null
    }

    const collection = await getUsersCollection()
    const user = await collection.findOne({ _id: new ObjectId(id) })

    if (!user) return null

    return this.mapDocToUser(user as UserDocument)
  }

  static async getUserByUsername(username: string): Promise<User | null> {
    const collection = await getUsersCollection()
    const user = await collection.findOne({ username })

    if (!user) return null

    return this.mapDocToUser(user as UserDocument)
  }

  static async authenticateUser(username: string, password: string): Promise<User | null> {
    const collection = await getUsersCollection()
    const hashedPassword = this.hashPassword(password)

    const user = await collection.findOne({
      username,
      password: hashedPassword,
    })

    if (!user) return null

    return this.mapDocToUser(user as UserDocument)
  }

  static async createUser(
    username: string,
    staffName: string,
    password: string,
    role: UserRole = "user",
  ): Promise<User> {
    const collection = await getUsersCollection()

    // Kiểm tra username đã tồn tại
    const existingUser = await collection.findOne({ username })
    if (existingUser) {
      throw new Error("Tài khoản đã tồn tại")
    }

    const hashedPassword = this.hashPassword(password)
    const now = new Date()

    const result = await collection.insertOne({
      username,
      staffName,
      password: hashedPassword,
      role,
      createdAt: now,
      updatedAt: now,
    })

    return {
      id: result.insertedId.toString(),
      username,
      staffName,
      role,
      createdAt: now,
      updatedAt: now,
    }
  }

  static async updateUser(id: string, updates: Partial<Omit<User, "id" | "password">>): Promise<User | null> {
    try {
      if (!ObjectId.isValid(id)) {
        console.error("[v0] Invalid ObjectId format:", id)
        return null
      }

      const collection = await getUsersCollection()
      const updateData: any = {
        ...updates,
        updatedAt: new Date(),
      }

      const result = await collection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: updateData },
        { returnDocument: "after" },
      )

      const updatedDoc = result?.value || result

      if (!updatedDoc || !updatedDoc._id) {
        console.error("[v0] Updated document missing _id:", updatedDoc)
        return null
      }

      return this.mapDocToUser(updatedDoc as UserDocument)
    } catch (error) {
      console.error("[v0] updateUser error:", error)
      throw error
    }
  }

  static async updateUserRole(id: string, newRole: UserRole): Promise<User | null> {
    return this.updateUser(id, { role: newRole })
  }

  static async changePassword(id: string, oldPassword: string, newPassword: string): Promise<boolean> {
    try {
      if (!ObjectId.isValid(id)) {
        return false
      }

      const collection = await getUsersCollection()
      const hashedOldPassword = this.hashPassword(oldPassword)
      const hashedNewPassword = this.hashPassword(newPassword)

      const user = await collection.findOne({ _id: new ObjectId(id) })
      if (!user || user.password !== hashedOldPassword) {
        return false
      }

      await collection.updateOne(
        { _id: new ObjectId(id) },
        {
          $set: {
            password: hashedNewPassword,
            updatedAt: new Date(),
          },
        },
      )

      return true
    } catch (error) {
      console.error("[v0] changePassword error:", error)
      throw error
    }
  }

  static async deleteUser(id: string): Promise<boolean> {
    try {
      if (!ObjectId.isValid(id)) {
        console.error("[v0] Invalid ObjectId format for delete:", id)
        return false
      }

      const collection = await getUsersCollection()
      const result = await collection.deleteOne({ _id: new ObjectId(id) })
      return result.deletedCount > 0
    } catch (error) {
      console.error("[v0] deleteUser error:", error)
      throw error
    }
  }

  static async deleteMultipleUsers(ids: string[]): Promise<number> {
    try {
      const validIds = ids.filter((id) => ObjectId.isValid(id))

      if (validIds.length === 0) {
        console.warn("[v0] No valid IDs to delete")
        return 0
      }

      const collection = await getUsersCollection()
      const result = await collection.deleteMany({
        _id: { $in: validIds.map((id) => new ObjectId(id)) },
      })

      return result.deletedCount || 0
    } catch (error) {
      console.error("[v0] deleteMultipleUsers error:", error)
      throw error
    }
  }
}

import { type NextRequest, NextResponse } from "next/server"
import { getUsersCollection } from "@/lib/mongodb"
import crypto from "crypto"

// Hash password
function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex")
}

export async function GET(request: NextRequest) {
  try {
    const collection = await getUsersCollection()

    // Kiểm tra xem đã tồn tại super_admin chưa
    const existingAdmin = await collection.findOne({ username: "superadmin" })
    if (existingAdmin) {
      return NextResponse.json({
        message: "Demo users đã tồn tại",
        users: await collection.find({}).toArray(),
      })
    }

    // Tạo 3 tài khoản demo
    const demoUsers = [
      {
        username: "superadmin",
        staffName: "Admin Cấp Cao",
        password: hashPassword("superadmin"),
        role: "super_admin",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        username: "admin",
        staffName: "Quản Lý Xe",
        password: hashPassword("admin"),
        role: "admin",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        username: "user",
        staffName: "Nhân Viên Xem",
        password: hashPassword("user123"),
        role: "user",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    const result = await collection.insertMany(demoUsers)

    return NextResponse.json({
      message: "Tạo tài khoản demo thành công",
      insertedCount: result.insertedCount,
      users: demoUsers.map((u) => ({
        username: u.username,
        staffName: u.staffName,
        role: u.role,
      })),
    })
  } catch (error) {
    console.error("[v0] Seed error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Lỗi khi seed data" },
      { status: 500 },
    )
  }
}

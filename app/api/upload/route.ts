import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-middleware"
import cloudinary from "@/lib/cloudinary"

export const config = {
  api: { bodyParser: false },
}

export const maxDuration = 60

export async function POST(request: NextRequest) {
  const authCheck = requireAuth(request, ["admin", "super_admin"])
  if (!authCheck.isValid) return authCheck.response!

  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null
    if (!file) {
      return NextResponse.json({ error: "Không có file được gửi lên" }, { status: 400 })
    }

    const isVideo = file.type.startsWith("video/")
    const maxSize = isVideo ? 100 * 1024 * 1024 : 10 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json({ error: `File vượt quá ${isVideo ? "100MB" : "10MB"}` }, { status: 400 })
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "video/mp4", "video/quicktime"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Chỉ hỗ trợ ảnh (JPG, PNG, WebP) và video (MP4, MOV)" }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const resourceType = file.type.startsWith("video/") ? "video" : "image"

    const result = await new Promise<{ secure_url: string; public_id: string; resource_type: string }>(
      (resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              folder: "hdvp-evidences",
              resource_type: resourceType,
            },
            (error, result) => {
              if (error || !result) reject(error || new Error("Upload failed"))
              else resolve(result)
            }
          )
          .end(buffer)
      }
    )

    return NextResponse.json({
      url: result.secure_url,
      publicId: result.public_id,
      resourceType: result.resource_type,
      name: file.name,
    })
  } catch (error) {
    console.error("[upload] error:", error)
    return NextResponse.json({ error: "Lỗi khi upload file" }, { status: 500 })
  }
}

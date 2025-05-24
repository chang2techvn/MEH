import { type NextRequest, NextResponse } from "next/server"
import { revalidatePath, revalidateTag } from "next/cache"

export async function POST(request: NextRequest) {
  try {
    // Lấy secret token từ request headers
    const token = request.headers.get("x-revalidate-token")

    // Kiểm tra token
    if (token !== process.env.REVALIDATE_TOKEN) {
      return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 })
    }

    // Parse body request
    const body = await request.json()
    const { path, tag } = body

    if (path) {
      // Revalidate specific path
      revalidatePath(path)
      return NextResponse.json({
        success: true,
        revalidated: true,
        message: `Path ${path} revalidated successfully`,
      })
    }

    if (tag) {
      // Revalidate by tag
      revalidateTag(tag)
      return NextResponse.json({
        success: true,
        revalidated: true,
        message: `Tag ${tag} revalidated successfully`,
      })
    }

    // Nếu không có path hoặc tag
    return NextResponse.json({ success: false, message: "No path or tag provided" }, { status: 400 })
  } catch (error) {
    console.error("Revalidation error:", error)
    return NextResponse.json({ success: false, message: "Error revalidating" }, { status: 500 })
  }
}

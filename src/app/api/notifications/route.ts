import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const createNotificationSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  message: z.string().min(1, "Message is required").max(1000),
  type: z.enum(["info", "success", "warning", "error"]),
  userId: z.string(),
  actionUrl: z.string().optional(),
  metadata: z.record(z.any()).optional(),
})

// GET /api/notifications - Get user's notifications
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const unreadOnly = searchParams.get("unreadOnly") === "true"
    const offset = (page - 1) * limit

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const where = {
      userId: user.id,
      ...(unreadOnly && { readAt: null })
    }

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: offset,
        take: limit,
      }),
      prisma.notification.count({ where })
    ])

    const unreadCount = await prisma.notification.count({
      where: {
        userId: user.id,
        readAt: null,
      }
    })

    return NextResponse.json({
      notifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      unreadCount,
    })
  } catch (error) {
    console.error("Failed to fetch notifications:", error)
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    )
  }
}

// POST /api/notifications - Create a notification (internal API)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createNotificationSchema.parse(body)

    const notification = await prisma.notification.create({
      data: {
        title: validatedData.title,
        message: validatedData.message,
        type: validatedData.type,
        userId: validatedData.userId,
        actionUrl: validatedData.actionUrl,
        metadata: validatedData.metadata,
      },
    })

    return NextResponse.json({ notification }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Failed to create notification:", error)
    return NextResponse.json(
      { error: "Failed to create notification" },
      { status: 500 }
    )
  }
}

// PUT /api/notifications - Mark notifications as read
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { notificationIds, markAllAsRead } = body

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (markAllAsRead) {
      await prisma.notification.updateMany({
        where: {
          userId: user.id,
          readAt: null,
        },
        data: {
          readAt: new Date(),
        },
      })
    } else if (notificationIds && Array.isArray(notificationIds)) {
      await prisma.notification.updateMany({
        where: {
          id: { in: notificationIds },
          userId: user.id,
        },
        data: {
          readAt: new Date(),
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to update notifications:", error)
    return NextResponse.json(
      { error: "Failed to update notifications" },
      { status: 500 }
    )
  }
}

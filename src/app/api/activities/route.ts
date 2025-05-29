import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const createActivitySchema = z.object({
  type: z.enum([
    "TASK_CREATED",
    "TASK_UPDATED", 
    "TASK_ASSIGNED",
    "TASK_COMPLETED",
    "TASK_DELETED",
    "COMMENT_ADDED",
    "STATUS_CHANGED",
    "PRIORITY_CHANGED"
  ]),
  description: z.string(),
  taskId: z.string().optional(),
  metadata: z.record(z.any()).optional(),
})

// GET /api/activities - Get activity feed
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const taskId = searchParams.get("taskId")
    const userId = searchParams.get("userId")
    const offset = (page - 1) * limit

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Build where clause for filtering
    const where: any = {}

    if (taskId) {
      where.taskId = taskId
    }

    if (userId) {
      where.userId = userId
    } else {
      // By default, get activities from user's organizations
      const userOrgs = await prisma.userOrganization.findMany({
        where: { userId: user.id },
        select: { organizationId: true }
      })

      if (userOrgs.length > 0) {
        // Get user's teams in their organizations
        const userTeams = await prisma.teamMember.findMany({
          where: { 
            userId: user.id,
            team: {
              organizationId: { in: userOrgs.map(o => o.organizationId) }
            }
          },
          select: { teamId: true }
        })

        // Get tasks from user's teams
        const tasks = await prisma.task.findMany({
          where: {
            OR: [
              { creatorId: user.id },
              { assigneeId: user.id },
              { teamId: { in: userTeams.map(t => t.teamId) } }
            ]
          },
          select: { id: true }
        })

        where.OR = [
          { userId: user.id }, // User's own activities
          { taskId: { in: tasks.map(t => t.id) } } // Activities from accessible tasks
        ]
      } else {
        // If user has no organizations, only show their own activities
        where.userId = user.id
      }
    }

    const [activities, total] = await Promise.all([
      prisma.activity.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            }
          },
          task: {
            select: {
              id: true,
              title: true,
              shareableId: true,
            }
          }
        },
        orderBy: { createdAt: "desc" },
        skip: offset,
        take: limit,
      }),
      prisma.activity.count({ where })
    ])

    return NextResponse.json({
      activities,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Failed to fetch activities:", error)
    return NextResponse.json(
      { error: "Failed to fetch activities" },
      { status: 500 }
    )
  }
}

// POST /api/activities - Create activity (internal API)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createActivitySchema.parse(body)

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const activity = await prisma.activity.create({
      data: {
        type: validatedData.type,
        description: validatedData.description,
        taskId: validatedData.taskId,
        metadata: validatedData.metadata ? JSON.stringify(validatedData.metadata) : null,
        userId: user.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          }
        },
        task: {
          select: {
            id: true,
            title: true,
            shareableId: true,
          }
        }
      }
    })

    return NextResponse.json({ activity }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Failed to create activity:", error)
    return NextResponse.json(
      { error: "Failed to create activity" },
      { status: 500 }
    )
  }
}

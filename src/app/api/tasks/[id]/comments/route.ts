import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const createCommentSchema = z.object({
  content: z.string().min(1, "Comment content is required").max(1000, "Comment too long"),
})

// GET /api/tasks/[id]/comments - Get task comments
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get the task first to check access
    const task = await prisma.task.findUnique({
      where: { id: params.id },
      include: {
        team: {
          include: {
            organization: true,
            members: {
              where: { userId: user.id }
            }
          }
        }
      }
    })

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    // Check if user has access to this task (team member or task creator/assignee)
    const hasAccess = task.creatorId === user.id || 
                     task.assigneeId === user.id ||
                     task.team.members.length > 0

    if (!hasAccess) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const comments = await prisma.comment.findMany({
      where: { taskId: params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          }
        }
      },
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json({ comments })
  } catch (error) {
    console.error("Failed to fetch comments:", error)
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    )
  }
}

// POST /api/tasks/[id]/comments - Create comment
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createCommentSchema.parse(body)

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get the task first to check access
    const task = await prisma.task.findUnique({
      where: { id: params.id },
      include: {
        team: {
          include: {
            organization: true,
            members: {
              where: { userId: user.id }
            }
          }
        }
      }
    })

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    // Check if user has access to this task (team member or task creator/assignee)
    const hasAccess = task.creatorId === user.id || 
                     task.assigneeId === user.id ||
                     task.team.members.length > 0

    if (!hasAccess) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Create the comment
    const comment = await prisma.comment.create({
      data: {
        content: validatedData.content,
        taskId: params.id,
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
        }
      }
    })

    // Create activity log
    try {
      await prisma.activity.create({
        data: {
          type: "COMMENT_ADDED",
          description: `${user.name || user.email} added a comment to "${task.title}"`,
          taskId: params.id,
          userId: user.id,
          metadata: JSON.stringify({
            comment: validatedData.content.substring(0, 100) + (validatedData.content.length > 100 ? "..." : "")
          })
        }
      })
    } catch (activityError) {
      console.error("Failed to create activity log:", activityError)
      // Don't fail the comment creation if activity logging fails
    }

    return NextResponse.json({ comment }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Failed to create comment:", error)
    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 }
    )
  }
}

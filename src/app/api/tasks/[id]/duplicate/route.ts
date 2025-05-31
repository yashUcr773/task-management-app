import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

// POST /api/tasks/[id]/duplicate - Duplicate a task
export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: taskId } = await params

    // Get current user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }    // Get the original task with all its data
    const originalTask = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        tags: true,
        assignee: true,
        creator: true
      }
    })

    if (!originalTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    // Check permissions - user must be creator or assignee
    if (originalTask.creatorId !== user.id && originalTask.assigneeId !== user.id) {
      return NextResponse.json(
        { error: "You don't have permission to duplicate this task" },
        { status: 403 }
      )
    }    // Create the duplicated task
    const duplicatedTask = await prisma.task.create({
      data: {
        title: `${originalTask.title} (Copy)`,
        description: originalTask.description,
        status: "TODO", // Reset status to TODO
        priority: originalTask.priority,
        storyPoints: originalTask.storyPoints,
        dueDate: originalTask.dueDate,
        assigneeId: originalTask.assigneeId,
        creatorId: user.id, // Current user becomes the creator
        teamId: originalTask.teamId, // Keep the same team
        epicId: originalTask.epicId,
        sprintId: originalTask.sprintId,
        tags: {
          connect: originalTask.tags.map(tag => ({ id: tag.id }))
        }
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        },
        tags: true,
        epic: {
          select: {
            id: true,
            title: true
          }
        },
        sprint: {
          select: {
            id: true,
            name: true
          }
        },
        _count: {
          select: {
            comments: true,
            attachments: true
          }
        }
      }
    })

    return NextResponse.json({
      task: duplicatedTask,
      message: "Task duplicated successfully"
    })

  } catch (error) {
    console.error("Error duplicating task:", error)
    return NextResponse.json(
      { error: "Failed to duplicate task" },
      { status: 500 }
    )
  }
}

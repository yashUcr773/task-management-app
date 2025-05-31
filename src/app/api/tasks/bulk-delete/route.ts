import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const bulkDeleteSchema = z.object({
  taskIds: z.array(z.string()).min(1, "At least one task ID is required")
})

// DELETE /api/tasks/bulk-delete - Delete multiple tasks
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validation = bulkDeleteSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: validation.error.errors },
        { status: 400 }
      )
    }

    const { taskIds } = validation.data

    // Get current user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Verify that all tasks exist and user has permission to delete them
    const tasks = await prisma.task.findMany({
      where: {
        id: { in: taskIds }
      },
      include: {
        assignee: true,
        creator: true
      }
    })

    if (tasks.length !== taskIds.length) {
      return NextResponse.json(
        { error: "Some tasks not found" },
        { status: 404 }
      )
    }

    // Check permissions - user must be creator or assignee
    const unauthorizedTasks = tasks.filter(task => 
      task.creatorId !== user.id && task.assigneeId !== user.id
    )

    if (unauthorizedTasks.length > 0) {
      return NextResponse.json(
        { error: "You don't have permission to delete some of these tasks" },
        { status: 403 }
      )
    }

    // Delete the tasks (this will cascade delete related data)
    const deletedTasks = await prisma.task.deleteMany({
      where: {
        id: { in: taskIds }
      }
    })

    return NextResponse.json({
      message: `Successfully deleted ${deletedTasks.count} tasks`,
      deletedCount: deletedTasks.count
    })

  } catch (error) {
    console.error("Error deleting tasks:", error)
    return NextResponse.json(
      { error: "Failed to delete tasks" },
      { status: 500 }
    )
  }
}

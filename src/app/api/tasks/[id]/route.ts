import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const updateTaskSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  status: z.enum(["PICKED", "TODO", "IN_DEV", "WITH_QA", "READY", "AWAITING_INPUTS", "RELEASED"]).optional(),
  priority: z.enum(["HIGH", "MEDIUM", "LOW"]).optional(),
  storyPoints: z.number().min(0).max(100).optional(),
  dueDate: z.string().optional(), // ISO date string
  assigneeId: z.string().optional(),
  epicId: z.string().optional(),
  sprintId: z.string().optional(),
  tags: z.array(z.object({
    name: z.string(),
    color: z.string()
  })).optional(),
})

interface RouteParams {
  params: {
    id: string
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { id } = params

    if (!id) {
      return NextResponse.json(
        { error: "Task ID is required" },
        { status: 400 }
      )
    }

    // Get the current user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Get user's organizations
    const userOrgs = await prisma.organizationMember.findMany({
      where: { userId: user.id },
      select: { organizationId: true }
    })

    const orgIds = userOrgs.map(org => org.organizationId)

    // Get task with access control
    const task = await prisma.task.findFirst({
      where: {
        id,
        organizationId: {
          in: orgIds
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
        reporter: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        },
        epic: true,
        sprint: true,
        tags: true,
        organization: true,
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        attachments: true,
        activities: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 20
        }
      }
    })

    if (!task) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ task })

  } catch (error) {
    console.error("Error fetching task:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { id } = params

    if (!id) {
      return NextResponse.json(
        { error: "Task ID is required" },
        { status: 400 }
      )
    }

    const body = await request.json()
    const validatedData = updateTaskSchema.parse(body)

    // Get the current user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Get user's organizations
    const userOrgs = await prisma.organizationMember.findMany({
      where: { userId: user.id },
      select: { organizationId: true }
    })

    const orgIds = userOrgs.map(org => org.organizationId)

    // Check if task exists and user has access
    const existingTask = await prisma.task.findFirst({
      where: {
        id,
        organizationId: {
          in: orgIds
        }
      },
      include: {
        organization: true
      }
    })

    if (!existingTask) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      )
    }

    // Prepare update data
    const updateData: any = {}
    
    if (validatedData.title !== undefined) updateData.title = validatedData.title
    if (validatedData.description !== undefined) updateData.description = validatedData.description
    if (validatedData.status !== undefined) updateData.status = validatedData.status
    if (validatedData.priority !== undefined) updateData.priority = validatedData.priority
    if (validatedData.storyPoints !== undefined) updateData.storyPoints = validatedData.storyPoints
    if (validatedData.dueDate !== undefined) {
      updateData.dueDate = validatedData.dueDate ? new Date(validatedData.dueDate) : null
    }
    if (validatedData.assigneeId !== undefined) updateData.assigneeId = validatedData.assigneeId || null
    if (validatedData.epicId !== undefined) updateData.epicId = validatedData.epicId || null
    if (validatedData.sprintId !== undefined) updateData.sprintId = validatedData.sprintId || null

    // Update the task
    const updatedTask = await prisma.task.update({
      where: { id },
      data: updateData,
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        },
        reporter: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        },
        epic: true,
        sprint: true,
        tags: true,
        organization: true
      }
    })

    // Handle tags if provided
    if (validatedData.tags !== undefined) {
      // First, disconnect all existing tags
      await prisma.task.update({
        where: { id },
        data: {
          tags: {
            set: []
          }
        }
      })

      if (validatedData.tags.length > 0) {
        // Create tags that don't exist and get all tag IDs
        const tagOperations = validatedData.tags.map(async (tag) => {
          return prisma.tag.upsert({
            where: {
              name_organizationId: {
                name: tag.name,
                organizationId: existingTask.organizationId
              }
            },
            update: {},
            create: {
              name: tag.name,
              color: tag.color,
              organizationId: existingTask.organizationId
            }
          })
        })

        const tags = await Promise.all(tagOperations)

        // Connect new tags to task
        await prisma.task.update({
          where: { id },
          data: {
            tags: {
              connect: tags.map(tag => ({ id: tag.id }))
            }
          }
        })
      }
    }

    // Create activity log for updates
    const changes = []
    if (validatedData.status && validatedData.status !== existingTask.status) {
      changes.push(`Status changed from ${existingTask.status} to ${validatedData.status}`)
    }
    if (validatedData.priority && validatedData.priority !== existingTask.priority) {
      changes.push(`Priority changed from ${existingTask.priority} to ${validatedData.priority}`)
    }
    if (validatedData.assigneeId !== undefined && validatedData.assigneeId !== existingTask.assigneeId) {
      changes.push(`Assignee changed`)
    }

    if (changes.length > 0) {
      await prisma.activity.create({
        data: {
          type: "TASK_UPDATED",
          taskId: id,
          userId: user.id,
          metadata: JSON.stringify({
            changes,
            updatedFields: Object.keys(updateData)
          })
        }
      })
    }

    // Fetch the complete updated task
    const completeTask = await prisma.task.findUnique({
      where: { id },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        },
        reporter: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        },
        epic: true,
        sprint: true,
        tags: true,
        organization: true
      }
    })

    return NextResponse.json({
      message: "Task updated successfully",
      task: completeTask
    })

  } catch (error) {
    console.error("Error updating task:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { id } = params

    if (!id) {
      return NextResponse.json(
        { error: "Task ID is required" },
        { status: 400 }
      )
    }

    // Get the current user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Get user's organizations
    const userOrgs = await prisma.organizationMember.findMany({
      where: { userId: user.id },
      select: { organizationId: true }
    })

    const orgIds = userOrgs.map(org => org.organizationId)

    // Check if task exists and user has access
    const existingTask = await prisma.task.findFirst({
      where: {
        id,
        organizationId: {
          in: orgIds
        }
      }
    })

    if (!existingTask) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      )
    }

    // TODO: Add role-based access control for deletion
    // For now, only allow the reporter or assignee to delete
    if (existingTask.reporterId !== user.id && existingTask.assigneeId !== user.id) {
      return NextResponse.json(
        { error: "You don't have permission to delete this task" },
        { status: 403 }
      )
    }

    // Create activity log before deletion
    await prisma.activity.create({
      data: {
        type: "TASK_DELETED",
        taskId: id,
        userId: user.id,
        metadata: JSON.stringify({
          title: existingTask.title,
          status: existingTask.status,
          priority: existingTask.priority
        })
      }
    })

    // Delete the task (cascading deletes will handle related records)
    await prisma.task.delete({
      where: { id }
    })

    return NextResponse.json({
      message: "Task deleted successfully"
    })

  } catch (error) {
    console.error("Error deleting task:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

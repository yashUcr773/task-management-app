import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const createTaskSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().optional(),
  status: z.enum(["PICKED", "TODO", "IN_DEV", "WITH_QA", "READY", "AWAITING_INPUTS", "RELEASED"]).optional(),
  priority: z.enum(["HIGH", "MEDIUM", "LOW"]).optional(),
  storyPoints: z.number().min(0).max(100).optional().nullable(),
  dueDate: z.string().optional().nullable(), // ISO date string
  assigneeId: z.string().optional().nullable(),
  teamId: z.string().optional(),
  epicId: z.string().optional().nullable(),
  sprintId: z.string().optional().nullable(),
  tags: z.array(z.object({
    name: z.string(),
    color: z.string()
  })).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    console.log("🚀 ~ POST ~ body:", body)
    const validatedData = createTaskSchema.parse(body)

    // Get the current user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }    // Support team selection with fallback to user's first team
    let teamId = validatedData.teamId;
    
    if (!teamId) {
      // Fallback: use the user's first organization's first team
      const userOrg = await prisma.userOrganization.findFirst({
        where: { userId: user.id },
        include: { 
          organization: {
            include: {
              teams: true
            }
          }
        }
      })

      if (!userOrg || !userOrg.organization.teams.length) {
        return NextResponse.json(
          { error: "User not part of any organization with teams" },
          { status: 400 }
        )
      }

      teamId = userOrg.organization.teams[0].id
    } else {
      // Verify user has access to the specified team
      const teamAccess = await prisma.team.findFirst({
        where: {
          id: teamId,
          OR: [
            {
              members: {
                some: {
                  userId: user.id
                }
              }
            },
            {
              organization: {
                users: {
                  some: {
                    userId: user.id,
                    role: "ADMIN"
                  }
                }
              }
            }
          ]
        }
      })

      if (!teamAccess) {
        return NextResponse.json(
          { error: "You don't have access to this team" },
          { status: 403 }
        )
      }
    }// Create the task
    const task = await prisma.task.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        status: validatedData.status,
        priority: validatedData.priority,
        storyPoints: validatedData.storyPoints,
        dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : null,
        assigneeId: validatedData.assigneeId || null,
        creatorId: user.id,
        teamId: teamId,
        epicId: validatedData.epicId || null,
        sprintId: validatedData.sprintId || null,
        // tags will be handled separately due to many-to-many relationship
      },      include: {
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
        epic: true,
        sprint: true,
        team: {
          include: {
            organization: true
          }
        }
      }
    })    // Handle tags if provided
    if (validatedData.tags && validatedData.tags.length > 0) {
      // Create tags that don't exist and get all tag IDs
      const tagOperations = validatedData.tags.map(async (tag) => {
        return prisma.tag.upsert({
          where: {
            name: tag.name
          },
          update: {},
          create: {
            name: tag.name,
            color: tag.color
          }
        })
      })

      const tags = await Promise.all(tagOperations)

      // Connect tags to task using TaskTag join table
      const taskTagConnections = tags.map(tag => ({
        taskId: task.id,
        tagId: tag.id
      }))

      await prisma.taskTag.createMany({
        data: taskTagConnections
      })
    }    // Create activity log
    await prisma.activity.create({
      data: {
        type: "TASK_CREATED",
        description: `Created task: ${task.title}`,
        taskId: task.id,
        userId: user.id,
        metadata: JSON.stringify({
          title: task.title,
          status: task.status,
          priority: task.priority
        })
      }
    })    // Fetch the complete task with all relations
    const completeTask = await prisma.task.findUnique({
      where: { id: task.id },
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
        epic: true,
        sprint: true,
        tags: {
          include: {
            tag: true
          }
        },
        team: {
          include: {
            organization: true
          }
        }
      }
    })

    return NextResponse.json({
      message: "Task created successfully",
      task: completeTask
    })

  } catch (error) {
    console.error("Error creating task:", error)
    
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

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "50")
    const search = searchParams.get("search") || ""
    const status = searchParams.get("status")
    const priority = searchParams.get("priority")
    const assigneeId = searchParams.get("assigneeId")
    const epicId = searchParams.get("epicId")
    const sprintId = searchParams.get("sprintId")

    // Get the current user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }    // Get user's organizations
    const userOrgs = await prisma.userOrganization.findMany({
      where: { userId: user.id },
      select: { organizationId: true }
    })

    const orgIds = userOrgs.map((org: { organizationId: string }) => org.organizationId)

    if (orgIds.length === 0) {
      return NextResponse.json({
        tasks: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0
        }
      })
    }    // Build filters
    const where: Record<string, unknown> = {
      team: {
        organizationId: {
          in: orgIds
        }
      }
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (status) {
      where.status = status
    }

    if (priority) {
      where.priority = priority
    }

    if (assigneeId) {
      where.assigneeId = assigneeId
    }

    if (epicId) {
      where.epicId = epicId
    }

    if (sprintId) {
      where.sprintId = sprintId
    }

    // Get total count
    const total = await prisma.task.count({ where })    // Get tasks with pagination
    const tasks = await prisma.task.findMany({
      where,
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
        epic: true,
        sprint: true,
        tags: {
          include: {
            tag: true
          }
        },
        team: {
          include: {
            organization: true
          }
        },
        _count: {
          select: {
            comments: true,
            attachments: true
          }
        }
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ],
      skip: (page - 1) * limit,
      take: limit
    })

    return NextResponse.json({
      tasks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error("Error fetching tasks:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

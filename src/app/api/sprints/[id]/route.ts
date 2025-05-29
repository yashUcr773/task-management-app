import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const updateSprintSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters").optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  isActive: z.boolean().optional(),
})

type RouteParams = {
  params: {
    id: string
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params

    // Get user's teams
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        teamMembers: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const teamIds = user.teamMembers.map(tm => tm.teamId)

    // Get sprint with access control
    const sprint = await prisma.sprint.findFirst({
      where: {
        id,
        teamId: {
          in: teamIds
        }
      },
      include: {
        team: {
          include: {
            organization: true,
            members: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true
                  }
                }
              }
            }
          }
        },
        tasks: {
          include: {
            assignee: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true
              }
            },
            tags: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        _count: {
          select: {
            tasks: true
          }
        }
      }
    })

    if (!sprint) {
      return NextResponse.json({ error: "Sprint not found" }, { status: 404 })
    }

    return NextResponse.json(sprint)
  } catch (error) {
    console.error("Error fetching sprint:", error)
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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params
    const body = await request.json()
    const validatedData = updateSprintSchema.parse(body)

    // Get user's teams
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        teamMembers: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const teamIds = user.teamMembers.map(tm => tm.teamId)

    // Check if sprint exists and user has access
    const existingSprint = await prisma.sprint.findFirst({
      where: {
        id,
        teamId: {
          in: teamIds
        }
      }
    })

    if (!existingSprint) {
      return NextResponse.json({ error: "Sprint not found" }, { status: 404 })
    }

    // Prepare update data
    const updateData: any = {}
    
    if (validatedData.name !== undefined) updateData.name = validatedData.name
    if (validatedData.startDate !== undefined) updateData.startDate = new Date(validatedData.startDate)
    if (validatedData.endDate !== undefined) updateData.endDate = new Date(validatedData.endDate)
    if (validatedData.isActive !== undefined) {
      updateData.isActive = validatedData.isActive
      
      // If setting this sprint as active, deactivate other sprints in the same team
      if (validatedData.isActive) {
        await prisma.sprint.updateMany({
          where: {
            teamId: existingSprint.teamId,
            id: { not: id }
          },
          data: { isActive: false }
        })
      }
    }

    // Validate dates if both are provided
    if (updateData.startDate && updateData.endDate && updateData.startDate >= updateData.endDate) {
      return NextResponse.json(
        { error: "End date must be after start date" },
        { status: 400 }
      )
    }

    // Update the sprint
    const updatedSprint = await prisma.sprint.update({
      where: { id },
      data: updateData,
      include: {
        team: {
          include: {
            organization: true
          }
        },
        _count: {
          select: {
            tasks: true
          }
        }
      }
    })

    return NextResponse.json(updatedSprint)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error updating sprint:", error)
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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params

    // Get user's teams
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        teamMembers: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const teamIds = user.teamMembers.map(tm => tm.teamId)

    // Check if sprint exists and user has access
    const existingSprint = await prisma.sprint.findFirst({
      where: {
        id,
        teamId: {
          in: teamIds
        }
      }
    })

    if (!existingSprint) {
      return NextResponse.json({ error: "Sprint not found" }, { status: 404 })
    }

    // Delete the sprint (tasks will have their sprintId set to null due to foreign key constraints)
    await prisma.sprint.delete({
      where: { id }
    })

    return NextResponse.json({ message: "Sprint deleted successfully" })
  } catch (error) {
    console.error("Error deleting sprint:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

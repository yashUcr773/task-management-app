import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const updateTeamSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  memberIds: z.array(z.string()).optional(),
})

type RouteParams = {
  params: Promise<{ id: string }>
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

    const { id } = await params
    const body = await request.json()
    const validatedData = updateTeamSchema.parse(body)

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

    // Check if team exists and user has admin access
    const existingTeam = await prisma.team.findFirst({
      where: {
        id,
        OR: [
          {
            members: {
              some: {
                userId: user.id,
                role: "ADMIN"
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
      },
      include: {
        members: {
          include: {
            user: true
          }
        }
      }
    })

    if (!existingTeam) {
      return NextResponse.json(
        { error: "Team not found or insufficient permissions" },
        { status: 404 }
      )
    }

    // Prepare update data
    const updateData: Record<string, unknown> = {}
    if (validatedData.name !== undefined) updateData.name = validatedData.name
    if (validatedData.description !== undefined) updateData.description = validatedData.description

    // Update the team
    const updatedTeam = await prisma.team.update({
      where: { id },
      data: updateData,
      include: {
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
        },
        organization: {
          select: {
            id: true,
            name: true
          }
        },
        _count: {
          select: {
            tasks: true
          }
        }
      }
    })

    // Handle member updates if provided
    if (validatedData.memberIds !== undefined) {
      // Get current member IDs (excluding the current user as admin)
      const currentMemberIds = existingTeam.members
        .filter(member => member.userId !== user.id)
        .map(member => member.userId)

      const newMemberIds = validatedData.memberIds.filter(id => id !== user.id)

      // Remove members who are no longer in the list
      const membersToRemove = currentMemberIds.filter(id => !newMemberIds.includes(id))
      if (membersToRemove.length > 0) {
        await prisma.teamMember.deleteMany({
          where: {
            teamId: id,
            userId: { in: membersToRemove }
          }
        })
      }

      // Add new members
      const membersToAdd = newMemberIds.filter(memberId => !currentMemberIds.includes(memberId))
      if (membersToAdd.length > 0) {
        await prisma.teamMember.createMany({
          data: membersToAdd.map(memberId => ({
            teamId: id,
            userId: memberId,
            role: "USER" as const
          }))
        })
      }

      // Fetch the updated team with new members
      const teamWithUpdatedMembers = await prisma.team.findUnique({
        where: { id },
        include: {
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
          },
          organization: {
            select: {
              id: true,
              name: true
            }
          },
          _count: {
            select: {
              tasks: true
            }
          }
        }
      })

      return NextResponse.json({
        message: "Team updated successfully",
        team: teamWithUpdatedMembers
      })
    }

    return NextResponse.json({
      message: "Team updated successfully",
      team: updatedTeam
    })

  } catch (error) {
    console.error("Error updating team:", error)
    
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

    const { id } = await params

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

    // Check if team exists and user has admin access
    const existingTeam = await prisma.team.findFirst({
      where: {
        id,
        OR: [
          {
            members: {
              some: {
                userId: user.id,
                role: "ADMIN"
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

    if (!existingTeam) {
      return NextResponse.json(
        { error: "Team not found or insufficient permissions" },
        { status: 404 }
      )
    }

    // Check if team has any tasks
    const taskCount = await prisma.task.count({
      where: { teamId: id }
    })

    if (taskCount > 0) {
      return NextResponse.json(
        { error: "Cannot delete team with existing tasks" },
        { status: 400 }
      )
    }

    // Delete team members first
    await prisma.teamMember.deleteMany({
      where: { teamId: id }
    })

    // Delete the team
    await prisma.team.delete({
      where: { id }
    })

    return NextResponse.json({
      message: "Team deleted successfully"
    })

  } catch (error) {
    console.error("Error deleting team:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

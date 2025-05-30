import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const createTeamSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  organizationId: z.string(),
  memberIds: z.array(z.string()).optional(),
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
    const validatedData = createTeamSchema.parse(body)

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

    // Check if user has admin access to the organization
    const orgMember = await prisma.organizationMember.findFirst({
      where: {
        userId: user.id,
        organizationId: validatedData.organizationId,
        role: "ADMIN"
      }
    })

    if (!orgMember) {
      return NextResponse.json(
        { error: "You don't have permission to create teams in this organization" },
        { status: 403 }
      )
    }

    // Create the team
    const team = await prisma.team.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        organizationId: validatedData.organizationId,
        members: {
          create: [
            // Add creator as admin
            {
              userId: user.id,
              role: "ADMIN"
            },
            // Add other members if provided
            ...(validatedData.memberIds || []).map(memberId => ({
              userId: memberId,
              role: "USER" as const
            }))
          ]
        }
      },
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
        organization: true,
        _count: {
          select: {
            tasks: true
          }
        }
      }
    })

    return NextResponse.json({
      message: "Team created successfully",
      team
    })

  } catch (error) {
    console.error("Error creating team:", error)
    
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
    const organizationId = searchParams.get("organizationId")

    // Get the current user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }    // Build where clause
    const where: Record<string, unknown> = {}

    if (organizationId) {
      // Check if user has access to the organization
      const orgMember = await prisma.organizationMember.findFirst({
        where: {
          userId: user.id,
          organizationId
        }
      })

      if (!orgMember) {
        return NextResponse.json(
          { error: "You don't have access to this organization" },
          { status: 403 }
        )
      }

      where.organizationId = organizationId
    } else {
      // Get teams from all user's organizations
      const userOrgs = await prisma.organizationMember.findMany({
        where: { userId: user.id },
        select: { organizationId: true }
      })

      const orgIds = userOrgs.map(org => org.organizationId)
      where.organizationId = { in: orgIds }
    }

    // Get teams where user is a member or has access through organization
    const teams = await prisma.team.findMany({
      where: {
        ...where,
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
              members: {
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
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ teams })

  } catch (error) {
    console.error("Error fetching teams:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

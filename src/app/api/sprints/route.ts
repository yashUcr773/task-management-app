import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const createSprintSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  teamId: z.string().min(1, "Team is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createSprintSchema.parse(body)

    // Verify user has access to the team
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        teamMembers: {
          where: { teamId: validatedData.teamId },
          include: { team: true }
        }
      }
    })

    if (!user || user.teamMembers.length === 0) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Validate dates
    const startDate = new Date(validatedData.startDate)
    const endDate = new Date(validatedData.endDate)

    if (startDate >= endDate) {
      return NextResponse.json(
        { error: "End date must be after start date" },
        { status: 400 }
      )
    }

    // Create the sprint
    const sprint = await prisma.sprint.create({
      data: {
        name: validatedData.name,
        teamId: validatedData.teamId,
        startDate,
        endDate,
      },
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

    return NextResponse.json(sprint, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error creating sprint:", error)
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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const teamId = searchParams.get("teamId")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const offset = (page - 1) * limit

    // Get user's teams
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        teamMembers: {
          include: { team: true }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const teamIds = user.teamMembers.map(tm => tm.teamId)

    // Build where clause
    const where: any = {
      teamId: {
        in: teamIds
      }
    }

    if (teamId) {
      where.teamId = teamId
    }

    // Get total count
    const total = await prisma.sprint.count({ where })

    // Get sprints with pagination
    const sprints = await prisma.sprint.findMany({
      where,
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
      },
      orderBy: [
        { isActive: 'desc' },
        { startDate: 'desc' }
      ],
      skip: offset,
      take: limit,
    })

    return NextResponse.json({
      sprints,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error("Error fetching sprints:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

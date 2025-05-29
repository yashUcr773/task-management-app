import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const createEpicSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must be less than 100 characters"),
  description: z.string().optional(),
  organizationId: z.string().min(1, "Organization is required"),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createEpicSchema.parse(body)

    // Verify user has access to the organization
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        organizationMembers: {
          where: { organizationId: validatedData.organizationId }
        }
      }
    })

    if (!user || user.organizationMembers.length === 0) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Create the epic
    const epic = await prisma.epic.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        organizationId: validatedData.organizationId,
      },
      include: {
        organization: true,
        _count: {
          select: {
            tasks: true
          }
        }
      }
    })

    return NextResponse.json(epic, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error creating epic:", error)
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
    const organizationId = searchParams.get("organizationId")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const offset = (page - 1) * limit

    // Get user's organizations
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        organizationMembers: {
          include: { organization: true }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const orgIds = user.organizationMembers.map(om => om.organizationId)

    // Build where clause
    const where: any = {
      organizationId: {
        in: orgIds
      }
    }

    if (organizationId) {
      where.organizationId = organizationId
    }

    // Get total count
    const total = await prisma.epic.count({ where })

    // Get epics with pagination
    const epics = await prisma.epic.findMany({
      where,
      include: {
        organization: true,
        _count: {
          select: {
            tasks: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: offset,
      take: limit,
    })

    return NextResponse.json({
      epics,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error("Error fetching epics:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const updateEpicSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must be less than 100 characters").optional(),
  description: z.string().optional(),
})

type RouteParams = {
  params: Promise<{
    id: string
  }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }    const { id } = await params

    // Get user's organizations
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        organizations: {
          select: {
            organizationId: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const orgIds = user.organizations.map((userOrg) => userOrg.organizationId)

    // Get epic with access control
    const epic = await prisma.epic.findFirst({
      where: {
        id,
        organizationId: {
          in: orgIds
        }
      },
      include: {
        organization: true,
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

    if (!epic) {
      return NextResponse.json({ error: "Epic not found" }, { status: 404 })
    }

    return NextResponse.json(epic)
  } catch (error) {
    console.error("Error fetching epic:", error)
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
    }    const { id } = await params
    const body = await request.json()
    const validatedData = updateEpicSchema.parse(body)

    // Get user's organizations
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        organizations: {
          select: {
            organizationId: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }
    
    const orgIds = user.organizations.map((userOrg) => userOrg.organizationId)

    // Check if epic exists and user has access
    const existingEpic = await prisma.epic.findFirst({
      where: {
        id,
        organizationId: {
          in: orgIds
        }
      }
    })

    if (!existingEpic) {
      return NextResponse.json({ error: "Epic not found" }, { status: 404 })
    }

    // Update the epic
    const updatedEpic = await prisma.epic.update({
      where: { id },
      data: validatedData,
      include: {
        organization: true,
        _count: {
          select: {
            tasks: true
          }
        }
      }
    })

    return NextResponse.json(updatedEpic)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error updating epic:", error)
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

    const { id } = await params    // Get user's organizations
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        organizations: {
          select: {
            organizationId: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const orgIds = user.organizations.map((userOrg) => userOrg.organizationId)

    // Check if epic exists and user has access
    const existingEpic = await prisma.epic.findFirst({
      where: {
        id,
        organizationId: {
          in: orgIds
        }
      }
    })

    if (!existingEpic) {
      return NextResponse.json({ error: "Epic not found" }, { status: 404 })
    }

    // Delete the epic (tasks will have their epicId set to null due to foreign key constraints)
    await prisma.epic.delete({
      where: { id }
    })

    return NextResponse.json({ message: "Epic deleted successfully" })
  } catch (error) {
    console.error("Error deleting epic:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

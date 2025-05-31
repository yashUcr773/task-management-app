import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const updateOrganizationSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional().nullable().transform(val => val || undefined),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = updateOrganizationSchema.parse(body)
    const { id: organizationId } = await params

    // Get the current user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }    // Check if user is admin of this organization
    const userOrganization = await prisma.userOrganization.findFirst({
      where: {
        userId: user.id,
        organizationId: organizationId,
        role: "ADMIN"
      }
    })

    if (!userOrganization) {
      return NextResponse.json(
        { error: "Forbidden: Only admins can update organization details" },
        { status: 403 }
      )
    }

    // Update the organization
    const organization = await prisma.organization.update({
      where: { id: organizationId },
      data: validatedData,
      include: {
        users: {
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
        teams: {
          include: {
            _count: {
              select: {
                members: true
              }
            }
          }
        },
        _count: {
          select: {
            epics: true
          }
        }
      }
    })

    return NextResponse.json({
      message: "Organization updated successfully",
      organization
    })

  } catch (error) {
    console.error("Error updating organization:", error)
    
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

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const joinOrganizationSchema = z.object({
  inviteCode: z.string().min(1),
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
    const validatedData = joinOrganizationSchema.parse(body)

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

    // For now, we'll treat the invite code as the organization ID
    // In a real implementation, you might want to have actual invite codes
    const organizationId = validatedData.inviteCode

    // Check if organization exists
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
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
        }
      }
    })

    if (!organization) {
      return NextResponse.json(
        { error: "Invalid invite code" },
        { status: 404 }
      )
    }

    // Check if user is already a member
    const existingMember = await prisma.userOrganization.findFirst({
      where: {
        userId: user.id,
        organizationId: organizationId
      }
    })

    if (existingMember) {
      return NextResponse.json(
        { error: "You are already a member of this organization" },
        { status: 400 }
      )
    }

    // Add user to organization
    await prisma.userOrganization.create({
      data: {
        userId: user.id,
        organizationId: organizationId,
        role: "USER"
      }
    })

    return NextResponse.json({
      message: "Successfully joined organization",
      organization: {
        id: organization.id,
        name: organization.name,
        description: organization.description
      }
    })

  } catch (error) {
    console.error("Error joining organization:", error)
    
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

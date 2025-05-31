import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: organizationId } = await params

    // Get the current user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Verify user has access to this organization
    const userOrganization = await prisma.userOrganization.findFirst({
      where: {        userId: user.id,
        organizationId: organizationId
      }
    })

    if (!userOrganization) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Get all members of the organization
    const members = await prisma.userOrganization.findMany({
      where: { organizationId },
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
      orderBy: [
        { role: 'asc' }, // Admin first
        { joinedAt: 'asc' }
      ]
    })

    return NextResponse.json({ members })
  } catch (error) {
    console.error("Error fetching organization members:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

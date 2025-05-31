import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(
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
    }

    // Check if user is a member of this organization
    const userOrganization = await prisma.userOrganization.findFirst({
      where: {
        userId: user.id,
        organizationId: organizationId
      }
    })

    if (!userOrganization) {
      return NextResponse.json(
        { error: "You are not a member of this organization" },
        { status: 404 }
      )
    }    // Check if this is the last admin
    if (userOrganization.role === "ADMIN") {
      const adminCount = await prisma.userOrganization.count({
        where: {
          organizationId: organizationId,
          role: "ADMIN"
        }
      })

      if (adminCount <= 1) {
        return NextResponse.json(
          { error: "Cannot leave organization as the last admin. Please transfer admin role to another member first." },
          { status: 400 }
        )
      }
    }

    // Remove user from organization
    await prisma.userOrganization.delete({
      where: { id: userOrganization.id }
    })

    return NextResponse.json({
      message: "Successfully left organization"
    })

  } catch (error) {
    console.error("Error leaving organization:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

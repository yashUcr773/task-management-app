import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const updateMemberSchema = z.object({
  role: z.enum(["USER", "VIEWER", "ADMIN"]),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; memberId: string }> }
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
    const validatedData = updateMemberSchema.parse(body)
    const { id: organizationId, memberId } = await params

    // Get the current user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }    // Check if current user is admin of this organization
    const currentUserOrganization = await prisma.userOrganization.findFirst({
      where: {
        userId: user.id,
        organizationId: organizationId,
        role: "ADMIN"
      }
    })

    if (!currentUserOrganization) {
      return NextResponse.json(
        { error: "Forbidden: Only admins can update member roles" },
        { status: 403 }
      )
    }

    // Get the member to update
    const memberToUpdate = await prisma.userOrganization.findFirst({
      where: {
        id: memberId,
        organizationId: organizationId
      }
    })

    if (!memberToUpdate) {
      return NextResponse.json(
        { error: "Member not found" },
        { status: 404 }
      )
    }

    // If demoting the last admin, prevent it
    if (memberToUpdate.role === "ADMIN" && validatedData.role !== "ADMIN") {
      const adminCount = await prisma.userOrganization.count({
        where: {
          organizationId: organizationId,
          role: "ADMIN"
        }
      })

      if (adminCount <= 1) {
        return NextResponse.json(
          { error: "Cannot demote the last admin. Please promote another member to admin first." },
          { status: 400 }
        )
      }
    }    // Update the member role
    const updatedMember = await prisma.userOrganization.update({
      where: { id: memberId },
      data: { role: validatedData.role },
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
    })

    return NextResponse.json({
      message: "Member role updated successfully",
      member: updatedMember
    })

  } catch (error) {
    console.error("Error updating member role:", error)
    
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; memberId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { id: organizationId, memberId } = await params

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

    // Check if current user is admin of this organization
    const currentUserOrganization = await prisma.userOrganization.findFirst({
      where: {
        userId: user.id,
        organizationId: organizationId,
        role: "ADMIN"
      }
    })

    if (!currentUserOrganization) {
      return NextResponse.json(
        { error: "Forbidden: Only admins can remove members" },
        { status: 403 }
      )
    }

    // Get the member to remove
    const memberToRemove = await prisma.userOrganization.findFirst({
      where: {
        id: memberId,
        organizationId: organizationId
      }
    })

    if (!memberToRemove) {
      return NextResponse.json(
        { error: "Member not found" },
        { status: 404 }
      )
    }

    // Prevent removing the last admin
    if (memberToRemove.role === "ADMIN") {
      const adminCount = await prisma.userOrganization.count({
        where: {
          organizationId: organizationId,
          role: "ADMIN"
        }
      })

      if (adminCount <= 1) {
        return NextResponse.json(
          { error: "Cannot remove the last admin from the organization" },
          { status: 400 }
        )
      }
    }

    // Remove the member
    await prisma.userOrganization.delete({
      where: { id: memberId }
    })

    return NextResponse.json({
      message: "Member removed successfully"
    })

  } catch (error) {
    console.error("Error removing member:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const organizationId = params.id

    // Verify user has access to this organization
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        organizationMembers: {
          where: { organizationId },
          include: { organization: true }
        }
      }
    })

    if (!user || user.organizationMembers.length === 0) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Get all members of the organization
    const members = await prisma.organizationMember.findMany({
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
      }
    })

    const formattedMembers = members.map(member => ({
      id: member.user.id,
      name: member.user.name,
      email: member.user.email,
      image: member.user.image,
      role: member.role,
      joinedAt: member.createdAt
    }))

    return NextResponse.json(formattedMembers)
  } catch (error) {
    console.error("Error fetching organization members:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

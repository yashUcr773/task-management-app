import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/user/list - Get list of users for assignment purposes
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get current user to find their organization/teams
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        teamMembers: {
          include: {
            team: {
              include: {
                organization: true
              }
            }
          }
        }
      }
    })

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get all users from the same organizations as the current user
    const organizationIds = currentUser.teamMembers
      .map(tm => tm.team.organization?.id)
      .filter(Boolean)

    let users = []

    if (organizationIds.length > 0) {
      // Get users from the same organizations
      users = await prisma.user.findMany({
        where: {
          teamMembers: {
            some: {
              team: {
                organizationId: {
                  in: organizationIds
                }
              }
            }
          }
        },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
        orderBy: {
          name: 'asc'
        }
      })
    } else {
      // If no organizations, just return the current user
      users = [{
        id: currentUser.id,
        name: currentUser.name,
        email: currentUser.email,
        image: currentUser.image,
      }]
    }

    return NextResponse.json({ 
      users,
      count: users.length 
    })

  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    )
  }
}

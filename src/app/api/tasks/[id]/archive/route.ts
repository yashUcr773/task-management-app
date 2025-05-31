import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: Promise<{ id: string }>
}

// POST /api/tasks/[id]/archive - Archive a task
export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: taskId } = await params
    const { archive = true } = await request.json()

    // Get current user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        organizations: {
          include: {
            organization: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get the task with team and organization info
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        team: {
          include: {
            organization: true
          }
        },
        creator: true,
        assignee: true
      }
    })

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    // Check if user has permission (must be in the same organization)
    const userOrgIds = user.organizations.map(uo => uo.organization.id)
    if (!userOrgIds.includes(task.team.organization.id)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Update the task's archived status
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: { 
        isArchived: archive 
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        },
        tags: true,
        epic: {
          select: {
            id: true,
            title: true
          }
        },
        sprint: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    // Create activity log
    await prisma.activity.create({
      data: {
        type: archive ? 'TASK_ARCHIVED' : 'TASK_UNARCHIVED',
        description: archive 
          ? `Task "${task.title}" was archived`
          : `Task "${task.title}" was unarchived`,
        userId: user.id,
        taskId: task.id
      }
    })

    return NextResponse.json({ 
      task: updatedTask,
      message: archive ? 'Task archived successfully' : 'Task unarchived successfully'
    })

  } catch (error) {
    console.error('Error archiving task:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

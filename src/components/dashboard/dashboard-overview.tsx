"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { 
  CheckSquare, 
  Clock, 
  AlertCircle, 
  Users, 
  Calendar,
  ArrowRight
} from "lucide-react"
import Link from "next/link"
import { useRealTimeTasks } from "@/hooks/use-real-time-tasks"
import { useEffect, useState } from "react"

interface TeamStats {
  totalMembers: number
  totalTeams: number
}

interface TeamWithMembers {
  members?: Array<{
    user: {
      id: string
      name: string
      email: string
      image?: string | null
    }
  }>
}

export function DashboardOverview() {
  const { tasks, taskStats, overdueTasks } = useRealTimeTasks()
  const [teamStats, setTeamStats] = useState<TeamStats>({ totalMembers: 0, totalTeams: 0 })

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) {
      return "Good morning! ☀️"
    } else if (hour < 17) {
      return "Good afternoon! 🌤️"
    } else {
      return "Good evening! 🌙"
    }
  }

  // Fetch team statistics
  useEffect(() => {
    const fetchTeamStats = async () => {
      try {
        const response = await fetch('/api/teams')
        if (response.ok) {
          const { teams } = await response.json()
          const totalMembers = teams.reduce((total: number, team: TeamWithMembers) => 
            total + (team.members?.length || 0), 0
          )
          setTeamStats({
            totalMembers,
            totalTeams: teams.length
          })
        }
      } catch (error) {
        console.error('Failed to fetch team stats:', error)
      }
    }

    fetchTeamStats()
  }, [])
  // Get recent tasks (last 5 tasks)
  const recentTasks = tasks.slice(0, 5)
  
  // Calculate dynamic stats
  const getDynamicStats = () => {
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    
    // Tasks created this week
    const thisWeekTasks = tasks.filter(task =>
      new Date(task.createdAt) >= oneWeekAgo
    )
    
    // Tasks in progress change (comparing to yesterday)
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayInProgressTasks = tasks.filter(task =>
      task.status === 'IN_DEV' && new Date(task.updatedAt) >= yesterday
    )
    
    // Tasks completed this week
    const thisWeekCompleted = tasks.filter(task =>
      task.status === 'RELEASED' && new Date(task.updatedAt) >= oneWeekAgo
    ).length
    
    return {
      newTasksThisWeek: thisWeekTasks.length,
      inProgressChange: yesterdayInProgressTasks.length,
      completedThisWeek: thisWeekCompleted
    }
  }
  
  const dynamicStats = getDynamicStats()
  
  // Get upcoming deadlines (tasks due in next 7 days)
  const upcomingDeadlines = tasks
    .filter(task => {
      if (!task.dueDate || task.status === 'RELEASED') return false
      const dueDate = new Date(task.dueDate)
      const sevenDaysFromNow = new Date()
      sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7)
      return dueDate <= sevenDaysFromNow && dueDate >= new Date()
    })
    .slice(0, 5)
  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{getGreeting()}</h1>
          <p className="text-muted-foreground">Here&apos;s what&apos;s happening with your projects today.</p>
        </div>
      </div>      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Link href="/tasks" className="block">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
              <CheckSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{taskStats.total}</div>
              <p className="text-xs text-muted-foreground">
                {dynamicStats.newTasksThisWeek > 0 
                  ? `+${dynamicStats.newTasksThisWeek} new this week`
                  : 'No new tasks this week'
                }
              </p>
            </CardContent>
          </Card>
        </Link>
        
        <Link href="/tasks?status=IN_DEV" className="block">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Clock className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{taskStats.inProgress}</div>
              <p className="text-xs text-muted-foreground">
                {dynamicStats.inProgressChange > 0 
                  ? `+${dynamicStats.inProgressChange} since yesterday`
                  : 'No recent changes'
                }
              </p>
            </CardContent>
          </Card>
        </Link>
        
        <Link href="/tasks?filter=overdue" className="block">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{overdueTasks.length}</div>
              <p className="text-xs text-muted-foreground">
                {overdueTasks.length > 0 
                  ? 'Requires attention'
                  : 'All tasks on track'
                }
              </p>
            </CardContent>
          </Card>
        </Link>
        
        <Link href="/tasks?status=RELEASED" className="block">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckSquare className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{taskStats.completed}</div>
              <p className="text-xs text-muted-foreground">
                {dynamicStats.completedThisWeek > 0 
                  ? `+${dynamicStats.completedThisWeek} this week`
                  : 'No completions this week'
                }
              </p>
            </CardContent>
          </Card>
        </Link>
        
        <Link href="/teams" className="block">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Team Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{teamStats.totalMembers}</div>
              <p className="text-xs text-muted-foreground">
                {teamStats.totalTeams === 1 
                  ? `Across ${teamStats.totalTeams} team`
                  : `Across ${teamStats.totalTeams} teams`
                }
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Tasks */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Tasks</CardTitle>
                <CardDescription>Latest task updates from your teams</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/tasks">
                  View all
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>          <CardContent className="space-y-4">
            {recentTasks.length > 0 ? recentTasks.map((task) => (
              <Link key={task.id} href={`/tasks?id=${task.id}`} className="block">
                <div className="flex items-center space-x-4 p-2 rounded-lg hover:bg-muted/50 transition-colors duration-200 cursor-pointer">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {task.assignee?.name ? task.assignee.name.slice(0, 2).toUpperCase() : 'UN'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">{task.title}</p>
                    <div className="flex items-center space-x-2">
                      <Badge variant={task.status === 'IN_DEV' ? 'default' : 'secondary'} className="text-xs">
                        {task.status.replace('_', ' ')}
                      </Badge>
                      <Badge variant={task.priority === 'HIGH' ? 'destructive' : task.priority === 'MEDIUM' ? 'default' : 'secondary'} className="text-xs">
                        {task.priority}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {task.dueDate ? `Due ${new Date(task.dueDate).toLocaleDateString()}` : 'No due date'}
                  </div>
                </div>
              </Link>
            )) : (
              <p className="text-sm text-muted-foreground">No recent tasks</p>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Deadlines */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Upcoming Deadlines</CardTitle>
                <CardDescription>Important dates and milestones</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/calendar">
                  <Calendar className="mr-2 h-4 w-4" />
                  Calendar
                </Link>
              </Button>
            </div>
          </CardHeader>          <CardContent className="space-y-4">
            {upcomingDeadlines.length > 0 ? upcomingDeadlines.map((task) => (
              <Link key={task.id} href={`/tasks?id=${task.id}`} className="block">
                <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors duration-200 cursor-pointer">
                  <div>
                    <p className="text-sm font-medium">{task.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {task.epic?.title ? `Epic: ${task.epic.title}` : 'Task'}
                    </p>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}
                  </div>
                </div>
              </Link>
            )) : (
              <p className="text-sm text-muted-foreground">No upcoming deadlines</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

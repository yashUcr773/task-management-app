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
  Plus,
  ArrowRight
} from "lucide-react"
import Link from "next/link"

export function DashboardOverview() {
  // Mock data - this will be replaced with real data from API
  const stats = {
    totalTasks: 42,
    inProgress: 8,
    overdue: 3,
    completed: 31,
    teamMembers: 12
  }

  const recentTasks = [
    {
      id: 1,
      title: "Implement user authentication",
      status: "IN_DEV",
      priority: "HIGH",
      assignee: "John Doe",
      dueDate: "2025-06-01"
    },
    {
      id: 2,
      title: "Design landing page mockups",
      status: "WITH_QA",
      priority: "MEDIUM",
      assignee: "Jane Smith",
      dueDate: "2025-05-30"
    },
    {
      id: 3,
      title: "Update API documentation",
      status: "TODO",
      priority: "LOW",
      assignee: "Mike Johnson",
      dueDate: "2025-06-03"
    }
  ]

  const upcomingDeadlines = [
    { title: "Project Alpha Release", date: "2025-06-01", type: "Release" },
    { title: "Sprint Review", date: "2025-05-31", type: "Meeting" },
    { title: "Client Presentation", date: "2025-06-02", type: "Presentation" }
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Good morning! 👋</h1>
          <p className="text-muted-foreground">Here&apos;s what&apos;s happening with your projects today.</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Task
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTasks}</div>
            <p className="text-xs text-muted-foreground">
              +2 from last week
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inProgress}</div>
            <p className="text-xs text-muted-foreground">
              +1 from yesterday
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.overdue}</div>
            <p className="text-xs text-muted-foreground">
              Needs attention
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckSquare className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">
              +5 this week
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.teamMembers}</div>
            <p className="text-xs text-muted-foreground">
              Across 3 teams
            </p>
          </CardContent>
        </Card>
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
          </CardHeader>
          <CardContent className="space-y-4">
            {recentTasks.map((task) => (
              <div key={task.id} className="flex items-center space-x-4">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{task.assignee.slice(0, 2)}</AvatarFallback>
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
                  Due {new Date(task.dueDate).toLocaleDateString()}
                </div>
              </div>
            ))}
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
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingDeadlines.map((deadline, index) => (
              <div key={index} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{deadline.title}</p>
                  <p className="text-xs text-muted-foreground">{deadline.type}</p>
                </div>
                <div className="text-sm text-muted-foreground">
                  {new Date(deadline.date).toLocaleDateString()}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <Button variant="outline" className="h-20 flex-col">
              <Plus className="h-5 w-5 mb-2" />
              Create Task
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Users className="h-5 w-5 mb-2" />
              Invite Team
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Calendar className="h-5 w-5 mb-2" />
              Schedule Meeting
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <CheckSquare className="h-5 w-5 mb-2" />
              View Reports
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

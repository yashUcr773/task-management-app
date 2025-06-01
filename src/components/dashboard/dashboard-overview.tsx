"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  CheckSquare, 
  Clock, 
  AlertCircle, 
  Users, 
  Calendar,
  ArrowRight,
  X
} from "lucide-react"
import Link from "next/link"
import { TaskDialog } from "@/components/tasks/task-dialog"
import { useRealTimeTasks } from "@/hooks/use-real-time-tasks"
import { useEffect, useState } from "react"
import { TasksWithUsersAndTags } from "@/types/all-types"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface TeamStats {
  totalMembers: number
  totalTeams: number
}

interface TeamMember {
  id: string
  role: string
  user: {
    id: string
    name: string
    email: string
    image?: string | null
  }
}

interface Team {
  id: string
  name: string
  description?: string
  organization: {
    id: string
    name: string
  }
  members: TeamMember[]
  _count: {
    tasks: number
  }
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

type TaskFilter = 'all' | 'in-progress' | 'overdue' | 'completed' | null

export function DashboardOverview() {
  const { tasks, taskStats, overdueTasks } = useRealTimeTasks()
  console.log("🚀 ~ DashboardOverview ~ tasks:", tasks)
  const [teamStats, setTeamStats] = useState<TeamStats>({ totalMembers: 0, totalTeams: 0 })
  const [teams, setTeams] = useState<Team[]>([])
  const [showTeamMembers, setShowTeamMembers] = useState(false)
  const [selectedFilter, setSelectedFilter] = useState<TaskFilter>(null)
  const [editTaskOpen, setEditTaskOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<TasksWithUsersAndTags | null>(null)

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
          setTeams(teams) // Store full team data
        }
      } catch (error) {
        console.error('Failed to fetch team stats:', error)
      }
    }

    fetchTeamStats()
  }, [])

  // Get role color styling
  const getRoleColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "USER":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "VIEWER":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  // Handle team members card click
  const handleTeamMembersClick = () => {
    setShowTeamMembers(true)
  }// Get recent tasks (last 5 tasks)
  const recentTasks = tasks.slice(0, 5)
  
  // Get filtered tasks based on selected filter
  const getFilteredTasks = () => {
    switch (selectedFilter) {
      case 'in-progress':
        return tasks.filter(task => task.status === 'IN_DEV')
      case 'overdue':
        return overdueTasks
      case 'completed':
        return tasks.filter(task => task.status === 'RELEASED')
      case 'all':
        return tasks
      default:
        return []
    }
  }
  
  const filteredTasks = getFilteredTasks()
  
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
      return dueDate <= sevenDaysFromNow && dueDate >= new Date()    })
    .slice(0, 5)

  const handleTaskClick = (task: TasksWithUsersAndTags) => {
    setEditingTask(task)
    setEditTaskOpen(true)
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{getGreeting()}</h1>
          <p className="text-muted-foreground">Here&apos;s what&apos;s happening with your projects today.</p>
        </div>
      </div>      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">        <Card 
          className={`cursor-pointer hover:shadow-lg transition-all duration-200 ${
            selectedFilter === 'all' ? 'ring-2 ring-primary bg-primary/5' : ''
          }`}
          onClick={() => setSelectedFilter(selectedFilter === 'all' ? null : 'all')}
        >
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
          <Card 
          className={`cursor-pointer hover:shadow-lg transition-all duration-200 ${
            selectedFilter === 'in-progress' ? 'ring-2 ring-blue-500 bg-blue-50' : ''
          }`}
          onClick={() => setSelectedFilter(selectedFilter === 'in-progress' ? null : 'in-progress')}
        >
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
          <Card 
          className={`cursor-pointer hover:shadow-lg transition-all duration-200 ${
            selectedFilter === 'overdue' ? 'ring-2 ring-red-500 bg-red-50' : ''
          }`}
          onClick={() => setSelectedFilter(selectedFilter === 'overdue' ? null : 'overdue')}
        >
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
          <Card 
          className={`cursor-pointer hover:shadow-lg transition-all duration-200 ${
            selectedFilter === 'completed' ? 'ring-2 ring-green-500 bg-green-50' : ''
          }`}
          onClick={() => setSelectedFilter(selectedFilter === 'completed' ? null : 'completed')}
        >
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
        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
          onClick={handleTeamMembersClick}
        >
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
        </Card></div>

      {/* Filtered Tasks Section */}
      {selectedFilter && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {selectedFilter === 'all' && <CheckSquare className="h-5 w-5" />}
                  {selectedFilter === 'in-progress' && <Clock className="h-5 w-5 text-blue-600" />}
                  {selectedFilter === 'overdue' && <AlertCircle className="h-5 w-5 text-red-600" />}
                  {selectedFilter === 'completed' && <CheckSquare className="h-5 w-5 text-green-600" />}
                  {selectedFilter === 'all' && 'All Tasks'}
                  {selectedFilter === 'in-progress' && 'In Progress Tasks'}
                  {selectedFilter === 'overdue' && 'Overdue Tasks'}
                  {selectedFilter === 'completed' && 'Completed Tasks'}
                  <Badge variant="secondary" className="ml-2">
                    {filteredTasks.length}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  {selectedFilter === 'all' && 'All tasks in your workspace'}
                  {selectedFilter === 'in-progress' && 'Tasks currently being worked on'}
                  {selectedFilter === 'overdue' && 'Tasks that need immediate attention'}
                  {selectedFilter === 'completed' && 'Successfully completed tasks'}
                </CardDescription>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSelectedFilter(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4 mr-2" />
                Clear Filter
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {filteredTasks.length > 0 ? (
              <div className="space-y-3">                {filteredTasks.slice(0, 10).map((task) => (
                  <div 
                    key={task.id} 
                    className="block cursor-pointer"
                    onClick={() => handleTaskClick(task)}
                  >
                    <div className="flex items-center space-x-4 p-3 rounded-lg border hover:bg-muted/50 transition-colors duration-200 cursor-pointer">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {task.assignee?.name ? task.assignee.name.slice(0, 2).toUpperCase() : 'UN'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium leading-none">{task.title}</p>
                          {task.isArchived && <Badge variant="outline" className="text-xs">Archived</Badge>}
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge 
                            variant={
                              task.status === 'IN_DEV' ? 'default' : 
                              task.status === 'RELEASED' ? 'secondary' : 
                              'outline'
                            } 
                            className="text-xs"
                          >
                            {task.status.replace('_', ' ')}
                          </Badge>
                          <Badge 
                            variant={
                              task.priority === 'HIGH' ? 'destructive' : 
                              task.priority === 'MEDIUM' ? 'default' : 
                              'secondary'
                            } 
                            className="text-xs"
                          >
                            {task.priority}
                          </Badge>
                          {task.tags && task.tags.length > 0 && (
                            <Badge variant="outline" className="text-xs">
                              {task.tags[0].name}
                              {task.tags.length > 1 && ` +${task.tags.length - 1}`}
                            </Badge>
                          )}
                        </div>
                        {task.description && (
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {task.description}
                          </p>
                        )}
                      </div>
                      <div className="text-right space-y-1">
                        <div className="text-xs text-muted-foreground">
                          {task.dueDate ? `Due ${new Date(task.dueDate).toLocaleDateString()}` : 'No due date'}
                        </div>
                        {selectedFilter === 'overdue' && task.dueDate && (
                          <div className="text-xs text-red-600 font-medium">
                            {Math.ceil((new Date().getTime() - new Date(task.dueDate).getTime()) / (1000 * 60 * 60 * 24))} days overdue
                          </div>
                        )}                      </div>
                    </div>
                  </div>
                ))}
                {filteredTasks.length > 10 && (
                  <div className="text-center pt-4">
                    <Button variant="outline" asChild>
                      <Link href={`/tasks${
                        selectedFilter === 'in-progress' ? '?status=IN_DEV' :
                        selectedFilter === 'overdue' ? '?filter=overdue' :
                        selectedFilter === 'completed' ? '?status=RELEASED' :
                        ''
                      }`}>
                        View all {filteredTasks.length} tasks
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-muted-foreground mb-2">
                  {selectedFilter === 'all' && 'No tasks found'}
                  {selectedFilter === 'in-progress' && 'No tasks in progress'}
                  {selectedFilter === 'overdue' && 'No overdue tasks'}
                  {selectedFilter === 'completed' && 'No completed tasks'}
                </div>
                <Button variant="outline" asChild>
                  <Link href="/tasks">
                    Go to Tasks
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

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
          </CardHeader><CardContent className="space-y-4">            {recentTasks.length > 0 ? recentTasks.map((task) => (
              <div 
                key={task.id} 
                className="block cursor-pointer"
                onClick={() => handleTaskClick(task)}
              >
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
                  </div>                  <div className="text-xs text-muted-foreground">
                    {task.dueDate ? `Due ${new Date(task.dueDate).toLocaleDateString()}` : 'No due date'}
                  </div>
                </div>
              </div>
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
          </CardHeader>          <CardContent className="space-y-4">            {upcomingDeadlines.length > 0 ? upcomingDeadlines.map((task) => (
              <div 
                key={task.id} 
                className="block cursor-pointer"
                onClick={() => handleTaskClick(task)}
              >
                <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors duration-200 cursor-pointer">
                  <div>
                    <p className="text-sm font-medium">{task.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {task.epic?.title ? `Epic: ${task.epic.title}` : 'Task'}
                    </p>
                  </div>                  <div className="text-sm text-muted-foreground">
                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}
                  </div>
                </div>
              </div>
            )) : (
              <p className="text-sm text-muted-foreground">No upcoming deadlines</p>
            )}
          </CardContent>        </Card>
      </div>      {/* Task Edit Dialog */}
      <TaskDialog 
        mode="edit"
        open={editTaskOpen} 
        onOpenChange={setEditTaskOpen}
        task={editingTask}
        onTaskUpdated={() => {
          setEditTaskOpen(false)
          setEditingTask(null)
        }}
      />

      {/* Team Members Dialog */}
      <Dialog open={showTeamMembers} onOpenChange={setShowTeamMembers}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Team Members
              <Badge variant="secondary" className="ml-2">
                {teamStats.totalMembers} total
              </Badge>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {teams.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No teams found</p>
              </div>
            ) : (
              teams.map((team) => (
                <Card key={team.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{team.name}</CardTitle>
                        <CardDescription className="flex items-center gap-2">
                          {team.description && (
                            <span>{team.description}</span>
                          )}
                          <Badge variant="outline" className="text-xs">
                            {team.organization.name}
                          </Badge>
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>{team.members.length} members</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <CheckSquare className="h-4 w-4" />
                          <span>{team._count.tasks} tasks</span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {team.members.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No members in this team</p>
                      ) : (
                        <div className="grid gap-3">
                          {team.members.map((member) => (
                            <div key={member.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10">
                                  <AvatarImage src={member.user.image || undefined} />
                                  <AvatarFallback>
                                    {member.user.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium">{member.user.name}</p>
                                  <p className="text-sm text-muted-foreground">{member.user.email}</p>
                                </div>
                              </div>
                              <Badge variant="secondary" className={`${getRoleColor(member.role)}`}>
                                {member.role}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

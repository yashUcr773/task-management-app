"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { 
  CheckSquare, 
  Search,
  Loader2,
  Calendar,
  User,
  Clock,
  AlertCircle,
  Target,
  Timer,
  ArrowRight,
} from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface User {
  id: string
  name: string
  email: string
  image?: string | null
}

interface Epic {
  id: string
  title: string
  color: string
}

interface Sprint {
  id: string
  name: string
  startDate: string
  endDate: string
}

interface Task {
  id: string
  title: string
  description?: string
  status: string
  priority: string
  storyPoints?: number
  dueDate?: string
  createdAt: string
  updatedAt: string
  assignee?: User
  creator: User
  epic?: Epic
  sprint?: Sprint
  _count: {
    comments: number
    attachments: number
  }
}

interface Team {
  id: string
  name: string
  description?: string
}

interface TeamTasksModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  team: Team | null
}

export function TeamTasksModal({
  open,
  onOpenChange,
  team,
}: TeamTasksModalProps) {
  const router = useRouter()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const fetchTeamTasks = useCallback( async () => {
    if (!team) return
    
    try {
      setLoading(true)
      const response = await fetch(`/api/tasks?teamId=${team.id}&limit=50`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch team tasks')
      }

      const data = await response.json()
      setTasks(data.tasks || [])
    } catch (error) {
      console.error("Error fetching team tasks:", error)
      toast.error("Failed to load team tasks")
    } finally {
      setLoading(false)
    }
  }, [team])

  useEffect(() => {
    if (team && open) {
      fetchTeamTasks()
    }
  }, [team, open, fetchTeamTasks])

  const filteredTasks = tasks.filter(task =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.assignee?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.priority.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case "TODO":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
      case "PICKED":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "IN_DEV":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "WITH_QA":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
      case "READY":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "AWAITING_INPUTS":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
      case "RELEASED":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "LOW":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
    }
  }

  const formatStatus = (status: string) => {
    return status.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, l => l.toUpperCase())
  }

  const isOverdue = (dueDate?: string) => {
    if (!dueDate) return false
    return new Date(dueDate) < new Date()
  }

  const handleViewAllTasks = () => {
    router.push(`/tasks?teamId=${team?.id}`)
    onOpenChange(false)
  }

  const handleTaskClick = (taskId: string) => {
    router.push(`/tasks?id=${taskId}`)
    onOpenChange(false)
  }

  if (!team) return null

  const tasksByStatus = {
    todo: tasks.filter(t => t.status === 'TODO').length,
    inProgress: tasks.filter(t => t.status === 'IN_DEV').length,
    done: tasks.filter(t => ['READY', 'RELEASED'].includes(t.status)).length,
    overdue: tasks.filter(t => isOverdue(t.dueDate)).length,
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5" />
            {team.name} - Team Tasks
          </DialogTitle>
          <DialogDescription>
            {team.description || "View and manage tasks assigned to this team"}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 space-y-4 overflow-hidden">
          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-4">
            <div className="p-3 border rounded-lg">
              <div className="text-2xl font-bold text-gray-600">{tasksByStatus.todo}</div>
              <div className="text-xs text-muted-foreground">To Do</div>
            </div>
            <div className="p-3 border rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{tasksByStatus.inProgress}</div>
              <div className="text-xs text-muted-foreground">In Progress</div>
            </div>
            <div className="p-3 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">{tasksByStatus.done}</div>
              <div className="text-xs text-muted-foreground">Completed</div>
            </div>
            <div className="p-3 border rounded-lg">
              <div className="text-2xl font-bold text-red-600">{tasksByStatus.overdue}</div>
              <div className="text-xs text-muted-foreground">Overdue</div>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search tasks by title, assignee, status..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Tasks List */}
          <div className="flex-1 overflow-y-auto space-y-3 max-h-[400px] pr-2">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                {searchQuery ? (
                  <p>No tasks match your search.</p>
                ) : (
                  <p>No tasks found for this team.</p>
                )}
              </div>
            ) : (
              filteredTasks.map((task) => (
                <div
                  key={task.id}
                  className="border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => handleTaskClick(task.id)}
                >
                  <div className="space-y-3">
                    {/* Task Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold truncate flex items-center gap-2">
                          {task.title}
                          {isOverdue(task.dueDate) && (
                            <AlertCircle className="h-4 w-4 text-red-500" />
                          )}
                        </h4>
                        {task.description && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {task.description}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        <Badge variant="outline" className={cn("text-xs", getStatusColor(task.status))}>
                          {formatStatus(task.status)}
                        </Badge>
                        <Badge variant="outline" className={cn("text-xs", getPriorityColor(task.priority))}>
                          {task.priority}
                        </Badge>
                      </div>
                    </div>

                    {/* Task Details */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        {/* Assignee */}
                        {task.assignee ? (
                          <div className="flex items-center gap-1">
                            <Avatar className="h-5 w-5">
                              <AvatarImage src={task.assignee.image || undefined} />
                              <AvatarFallback className="text-xs">
                                {task.assignee.name?.slice(0, 2).toUpperCase() || "U"}
                              </AvatarFallback>
                            </Avatar>
                            <span>{task.assignee.name || task.assignee.email}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            <span>Unassigned</span>
                          </div>
                        )}

                        {/* Story Points */}
                        {task.storyPoints && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{task.storyPoints} pts</span>
                          </div>
                        )}

                        {/* Epic */}
                        {task.epic && (
                          <div className="flex items-center gap-1">
                            <Target className="h-4 w-4" />
                            <span>{task.epic.title}</span>
                          </div>
                        )}

                        {/* Sprint */}
                        {task.sprint && (
                          <div className="flex items-center gap-1">
                            <Timer className="h-4 w-4" />
                            <span>{task.sprint.name}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {/* Due Date */}
                        {task.dueDate && (
                          <div className={cn(
                            "flex items-center gap-1",
                            isOverdue(task.dueDate) ? "text-red-600" : ""
                          )}>
                            <Calendar className="h-4 w-4" />
                            <span>{format(new Date(task.dueDate), "MMM d")}</span>
                          </div>
                        )}

                        {/* Comments & Attachments */}
                        <div className="flex items-center gap-2">
                          {task._count.comments > 0 && (
                            <span>{task._count.comments} comments</span>
                          )}
                          {task._count.attachments > 0 && (
                            <span>{task._count.attachments} files</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Summary */}
          {!loading && filteredTasks.length > 0 && (
            <div className="border-t pt-4">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>
                  Showing {filteredTasks.length} of {tasks.length} tasks
                </span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleViewAllTasks}
                  className="flex items-center gap-2"
                >
                  View All Tasks
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

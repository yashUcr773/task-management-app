"use client"

import { useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Calendar as CalendarIcon,
  AlertCircle
} from "lucide-react"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday } from "date-fns"
import { cn } from "@/lib/utils"

interface Task {
  id: string
  title: string
  description?: string
  status: string
  priority: "HIGH" | "MEDIUM" | "LOW"
  storyPoints?: number
  dueDate?: Date
  assignee?: {
    name: string
    email: string
    image?: string | null
  }
  tags?: Array<{ name: string; color: string }>
}

interface TasksCalendarProps {
  tasks: Task[]
  onTaskClick?: (task: Task) => void
}

// Mock tasks with due dates for demonstration
const mockTasksWithDates: Task[] = [
  {
    id: "1",
    title: "Implement user authentication",
    description: "Set up NextAuth.js with OAuth providers",
    status: "IN_DEV",
    priority: "HIGH",
    storyPoints: 8,
    dueDate: new Date(2024, 1, 15),
    assignee: {
      name: "John Doe",
      email: "john@example.com"
    },
    tags: [{ name: "Backend", color: "#10b981" }]
  },
  {
    id: "2",
    title: "Design dashboard UI",
    description: "Create wireframes and implement dashboard layout",
    status: "TODO",
    priority: "MEDIUM",
    storyPoints: 5,
    dueDate: new Date(2024, 1, 18),
    assignee: {
      name: "Jane Smith",
      email: "jane@example.com"
    },
    tags: [{ name: "Frontend", color: "#3b82f6" }]
  },
  {
    id: "3",
    title: "Fix login bug",
    description: "Users can't login with Google OAuth",
    status: "WITH_QA",
    priority: "HIGH",
    storyPoints: 3,
    dueDate: new Date(2024, 1, 12),
    assignee: {
      name: "Bob Johnson",
      email: "bob@example.com"
    },
    tags: [{ name: "Bug", color: "#ef4444" }]
  },
  {
    id: "4",
    title: "Update documentation",
    description: "Add API documentation for new endpoints",
    status: "TODO",
    priority: "LOW",
    storyPoints: 2,
    dueDate: new Date(2024, 1, 20),
    assignee: {
      name: "Alice Brown",
      email: "alice@example.com"
    },
    tags: [{ name: "Documentation", color: "#f59e0b" }]
  },
  {
    id: "5",
    title: "Performance optimization",
    description: "Optimize database queries and API responses",
    status: "PICKED",
    priority: "MEDIUM",
    storyPoints: 13,
    dueDate: new Date(2024, 1, 25),
    assignee: {
      name: "Charlie Wilson",
      email: "charlie@example.com"
    },
    tags: [{ name: "Backend", color: "#10b981" }]
  }
]

export function TasksCalendar({ tasks = mockTasksWithDates, onTaskClick }: TasksCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Get tasks for a specific date
  const getTasksForDate = (date: Date) => {
    return tasks.filter(task => 
      task.dueDate && isSameDay(task.dueDate, date)
    )
  }

  // Get tasks for selected date
  const selectedDateTasks = selectedDate ? getTasksForDate(selectedDate) : []

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return "border-red-500 bg-red-50"
      case "MEDIUM":
        return "border-yellow-500 bg-yellow-50"
      case "LOW":
        return "border-green-500 bg-green-50"
      default:
        return "border-gray-300 bg-gray-50"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "TODO":
        return "bg-gray-100 text-gray-800"
      case "IN_DEV":
        return "bg-blue-100 text-blue-800"
      case "WITH_QA":
        return "bg-yellow-100 text-yellow-800"
      case "READY":
        return "bg-green-100 text-green-800"
      case "RELEASED":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Calendar Section */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                {format(currentDate, "MMMM yyyy")}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateMonth('prev')}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentDate(new Date())}
                >
                  Today
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateMonth('next')}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Custom Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 mb-4">
              {/* Day Headers */}
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                  {day}
                </div>
              ))}
              
              {/* Calendar Days */}
              {monthDays.map((day) => {
                const dayTasks = getTasksForDate(day)
                const isSelected = selectedDate && isSameDay(day, selectedDate)
                const isCurrentDay = isToday(day)
                
                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => setSelectedDate(day)}
                    className={cn(
                      "p-2 text-left text-sm border rounded-lg hover:bg-gray-50 transition-colors min-h-[80px]",
                      isSelected && "ring-2 ring-blue-500 bg-blue-50",
                      isCurrentDay && "bg-blue-100 border-blue-300",
                      !isSelected && !isCurrentDay && "border-gray-200"
                    )}
                  >
                    <div className="font-medium mb-1">
                      {format(day, "d")}
                    </div>
                    <div className="space-y-1">
                      {dayTasks.slice(0, 2).map((task) => (
                        <div
                          key={task.id}
                          className={cn(
                            "text-xs p-1 rounded border-l-2 truncate",
                            getPriorityColor(task.priority)
                          )}
                          onClick={(e) => {
                            e.stopPropagation()
                            onTaskClick?.(task)
                          }}
                        >
                          {task.title}
                        </div>
                      ))}
                      {dayTasks.length > 2 && (
                        <div className="text-xs text-muted-foreground">
                          +{dayTasks.length - 2} more
                        </div>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground border-t pt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 border-l-2 border-red-500 bg-red-50 rounded"></div>
                <span>High Priority</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 border-l-2 border-yellow-500 bg-yellow-50 rounded"></div>
                <span>Medium Priority</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 border-l-2 border-green-500 bg-green-50 rounded"></div>
                <span>Low Priority</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Task Details Section */}
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>
                {selectedDate ? format(selectedDate, "MMM d, yyyy") : "Select a date"}
              </span>
              {selectedDateTasks.length > 0 && (
                <Badge variant="secondary">
                  {selectedDateTasks.length} task{selectedDateTasks.length !== 1 ? 's' : ''}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDateTasks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No tasks scheduled for this date</p>
              </div>
            ) : (
              <div className="space-y-4">
                {selectedDateTasks.map((task) => (
                  <div
                    key={task.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => onTaskClick?.(task)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-sm">{task.title}</h4>
                      <div className="flex items-center gap-2">
                        {task.priority === "HIGH" && (
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        )}
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          task.priority === "HIGH" ? "bg-red-500" :
                          task.priority === "MEDIUM" ? "bg-yellow-500" : "bg-green-500"
                        )} />
                      </div>
                    </div>
                    
                    {task.description && (
                      <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                        {task.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {task.assignee && (
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={task.assignee.image || undefined} />
                            <AvatarFallback className="text-xs">
                              {task.assignee.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <Badge variant="secondary" className={cn("text-xs", getStatusColor(task.status))}>
                          {task.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      
                      {task.storyPoints && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {task.storyPoints} pts
                        </div>
                      )}
                    </div>

                    {task.tags && task.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {task.tags.slice(0, 2).map((tag) => (
                          <Badge
                            key={tag.name}
                            variant="outline"
                            className="text-xs"
                            style={{ borderColor: tag.color, color: tag.color }}
                          >
                            {tag.name}
                          </Badge>
                        ))}
                        {task.tags.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{task.tags.length - 2}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">This Month Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Tasks</span>
              <span className="font-medium">{tasks.filter(t => t.dueDate && t.dueDate.getMonth() === currentDate.getMonth()).length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">High Priority</span>
              <span className="font-medium text-red-600">
                {tasks.filter(t => t.priority === "HIGH" && t.dueDate && t.dueDate.getMonth() === currentDate.getMonth()).length}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Completed</span>
              <span className="font-medium text-green-600">
                {tasks.filter(t => t.status === "RELEASED" && t.dueDate && t.dueDate.getMonth() === currentDate.getMonth()).length}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Overdue</span>
              <span className="font-medium text-red-600">
                {tasks.filter(t => t.dueDate && t.dueDate < new Date() && t.status !== "RELEASED").length}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

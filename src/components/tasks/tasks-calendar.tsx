"use client"

import React, { useState } from "react"
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
import { Skeleton } from "@/components/ui/skeleton"
import { TasksWithUsersAndTags } from "@/types/all-types"

interface TasksCalendarProps {
  tasks: TasksWithUsersAndTags[]
  onTaskClick?: (task: TasksWithUsersAndTags) => void
  isLoading?: boolean
}

export function TasksCalendar({ tasks = [], onTaskClick, isLoading }: TasksCalendarProps) {
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

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Section - Loading */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-32" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-8 w-8" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                    {day}
                  </div>
                ))}
                {Array.from({ length: 35 }).map((_, index) => (
                  <div key={index} className="p-2 text-sm border rounded-lg min-h-[80px]">
                    <Skeleton className="h-4 w-4 mb-2" />
                    <div className="space-y-1">
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Task Details Section - Loading */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-3 w-full mb-3" />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-6 w-6 rounded-full" />
                        <Skeleton className="h-5 w-16 rounded-full" />
                      </div>
                      <Skeleton className="h-4 w-12" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
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
                        {task.creator.id && (
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={task.creator.image || undefined} />
                            <AvatarFallback className="text-xs">
                              {task.creator.name?.split(' ').map(n => n[0]).join('')}
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
                            style={{ borderColor: tag.color || '#000000', color: tag.color || '#000000' }}
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
              <span className="font-medium">{tasks.filter(t => t.dueDate && new Date(t.dueDate).getMonth() === currentDate.getMonth()).length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">High Priority</span>
              <span className="font-medium text-red-600">
                {tasks.filter(t => t.priority === "HIGH" && t.dueDate && new Date(t.dueDate).getMonth() === currentDate.getMonth()).length}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Completed</span>
              <span className="font-medium text-green-600">
                {tasks.filter(t => t.status === "RELEASED" && t.dueDate && new Date(t.dueDate).getMonth() === currentDate.getMonth()).length}
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

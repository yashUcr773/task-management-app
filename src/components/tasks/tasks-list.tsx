"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Calendar, MessageSquare, Paperclip } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { Skeleton } from "@/components/ui/skeleton"

// Same mock data as other components
const mockTasks = [
  {
    id: "1",
    title: "Implement user authentication",
    description: "Set up NextAuth.js with Prisma adapter",
    status: "TODO",
    priority: "HIGH" as const,
    storyPoints: 8,
    dueDate: new Date("2025-06-01"),
    assignee: { name: "John Doe", email: "john@example.com", image: null },
    tags: [{ name: "Backend", color: "#3B82F6" }, { name: "Security", color: "#EF4444" }],
    createdAt: new Date("2025-05-20")
  },
  {
    id: "2", 
    title: "Design landing page",
    description: "Create responsive landing page with hero section",
    status: "IN_DEV",
    priority: "MEDIUM" as const,
    storyPoints: 5,
    dueDate: new Date("2025-05-30"),
    assignee: { name: "Jane Smith", email: "jane@example.com", image: null },
    tags: [{ name: "Frontend", color: "#10B981" }, { name: "Design", color: "#8B5CF6" }],
    createdAt: new Date("2025-05-18")
  },
  {
    id: "3",
    title: "Update API documentation", 
    description: "Document all REST endpoints with examples",
    status: "WITH_QA",
    priority: "LOW" as const,
    storyPoints: 3,
    dueDate: new Date("2025-06-03"),
    assignee: { name: "Mike Johnson", email: "mike@example.com", image: null },
    tags: [{ name: "Documentation", color: "#F59E0B" }],
    createdAt: new Date("2025-05-15")
  },
  {
    id: "4",
    title: "Setup CI/CD pipeline",
    description: "Configure GitHub Actions for automated testing and deployment",
    status: "READY",
    priority: "HIGH" as const,
    storyPoints: 13,
    dueDate: new Date("2025-06-05"),
    assignee: { name: "Sarah Wilson", email: "sarah@example.com", image: null },
    tags: [{ name: "DevOps", color: "#06B6D4" }],
    createdAt: new Date("2025-05-22")
  }
]

interface TasksListProps {
  searchQuery: string
  tasks?: any[]
  isLoading?: boolean
}

export function TasksList({ searchQuery, tasks: externalTasks, isLoading }: TasksListProps) {
  const [tasks, setTasks] = useState(externalTasks || mockTasks)
  const [selectedTasks, setSelectedTasks] = useState<string[]>([])

  // Update tasks when external tasks change
  useEffect(() => {
    if (externalTasks) {
      setTasks(externalTasks)
    }
  }, [externalTasks])

  const filteredTasks = tasks.filter(task => 
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.assignee?.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return "destructive"
      case "MEDIUM":
        return "default"
      case "LOW":
        return "secondary"
      default:
        return "secondary"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "TODO":
        return "secondary"
      case "IN_DEV":
        return "default"
      case "WITH_QA":
        return "outline"
      case "READY":
        return "default"
      default:
        return "secondary"
    }
  }

  const handleSelectTask = (taskId: string) => {
    setSelectedTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    )
  }

  const isOverdue = (dueDate?: Date) => {
    return dueDate && new Date() > dueDate
  }

  return (
    <div className="space-y-4">
      {selectedTasks.length > 0 && (
        <div className="flex items-center space-x-2 p-2 bg-muted rounded-md">
          <span className="text-sm text-muted-foreground">
            {selectedTasks.length} task(s) selected
          </span>
          <Button variant="outline" size="sm">
            Bulk Edit
          </Button>
          <Button variant="outline" size="sm">
            Delete
          </Button>
        </div>
      )}      <div className="space-y-2">
        {isLoading ? (
          // Loading skeleton cards
          Array.from({ length: 5 }).map((_, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-start space-x-4">
                  <Skeleton className="h-4 w-4 mt-1" />
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Skeleton className="h-6 w-16 rounded-full" />
                        <Skeleton className="h-6 w-12 rounded-full" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Skeleton className="h-6 w-20 rounded-full" />
                        <Skeleton className="h-6 w-12 rounded-full" />
                      </div>
                      <Skeleton className="h-8 w-8" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          filteredTasks.map((task) => (
          <Card key={task.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start space-x-4">
                <Checkbox
                  checked={selectedTasks.includes(task.id)}
                  onCheckedChange={() => handleSelectTask(task.id)}
                  className="mt-1"
                />
                
                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h3 className="font-medium leading-none">{task.title}</h3>
                      {task.description && (
                        <p className="text-sm text-muted-foreground">
                          {task.description}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Badge variant={getStatusColor(task.status)}>
                        {task.status.replace("_", " ")}
                      </Badge>
                      <Badge variant={getPriorityColor(task.priority)}>
                        {task.priority}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Edit</DropdownMenuItem>
                          <DropdownMenuItem>Duplicate</DropdownMenuItem>
                          <DropdownMenuItem>Archive</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {task.tags && task.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {task.tags.map((tag: any, index: number) => (
                        <Badge 
                          key={index} 
                          variant="outline" 
                          className="text-xs"
                          style={{ borderColor: tag.color, color: tag.color }}
                        >
                          {tag.name}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {task.assignee && (
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={task.assignee.image || ""} />
                            <AvatarFallback className="text-xs">
                              {task.assignee.name.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-muted-foreground">
                            {task.assignee.name}
                          </span>
                        </div>
                      )}

                      {task.storyPoints && (
                        <Badge variant="outline" className="text-xs">
                          {task.storyPoints} pts
                        </Badge>
                      )}

                      {task.dueDate && (
                        <div className={`flex items-center space-x-1 text-xs ${
                          isOverdue(task.dueDate) ? 'text-destructive' : 'text-muted-foreground'
                        }`}>
                          <Calendar className="h-3 w-3" />
                          <span>
                            Due {formatDistanceToNow(task.dueDate, { addSuffix: true })}
                          </span>
                        </div>
                      )}
                    </div>                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <MessageSquare className="h-3 w-3" />
                        <span>{task._count?.comments || 0}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Paperclip className="h-3 w-3" />
                        <span>{task._count?.attachments || 0}</span>
                      </div>
                      <span>
                        Created {formatDistanceToNow(task.createdAt, { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>            </CardContent>
          </Card>
        )))}

        {!isLoading && filteredTasks.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No tasks found matching your search.
          </div>
        )}
      </div>
    </div>
  )
}

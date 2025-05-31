"use client"

import React, { useState, useEffect } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
import { MoreHorizontal, ArrowUpDown, MessageSquare, Paperclip } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { Skeleton } from "@/components/ui/skeleton"
import { TasksWithUsersAndTags } from "@/types/all-types"
import { toast } from "sonner"
import { TaskDialog } from "./task-dialog"

interface TasksTableProps {
  searchQuery: string
  tasks?: TasksWithUsersAndTags[]
  isLoading?: boolean
}

export function TasksTable({ searchQuery, tasks: externalTasks, isLoading }: TasksTableProps) {
  const [tasks, setTasks] = useState(externalTasks || [])
  const [selectedTasks, setSelectedTasks] = useState<string[]>([])
  const [sortField, setSortField] = useState<string>("")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [editingTask, setEditingTask] = useState<TasksWithUsersAndTags | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  // Update tasks when external tasks change
  useEffect(() => {
    if (externalTasks) {
      setTasks(externalTasks)
    }
  }, [externalTasks])
  const filteredTasks = tasks.filter((task: TasksWithUsersAndTags) => 
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.assignee?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

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

  const handleSelectAll = () => {
    setSelectedTasks(
      selectedTasks.length === filteredTasks.length 
        ? [] 
        : filteredTasks.map(task => task.id)
    )
  }

  // Bulk operations handlers
  const handleBulkEdit = () => {
    toast.info(`Bulk edit feature coming soon for ${selectedTasks.length} tasks`)
  }

  const handleBulkDelete = async () => {
    if (selectedTasks.length === 0) return
    
    try {
      const response = await fetch('/api/tasks/bulk-delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ taskIds: selectedTasks }),
      })

      if (response.ok) {
        toast.success(`Successfully deleted ${selectedTasks.length} tasks`)
        setSelectedTasks([])
        // Refresh tasks by removing deleted ones
        setTasks(prev => prev.filter(task => !selectedTasks.includes(task.id)))
      } else {
        throw new Error('Failed to delete tasks')
      }
    } catch (error) {
      console.log("🚀 ~ handleBulkDelete ~ error:", error)
      toast.error('Failed to delete selected tasks')
    }
  }
  // Individual task operations
  const handleEditTask = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId)
    if (task) {
      setEditingTask(task)
      setIsEditDialogOpen(true)
    }
  }

  const handleTaskUpdated = (updatedTask: TasksWithUsersAndTags) => {
    setTasks(prev => prev.map(task => 
      task.id === updatedTask.id ? updatedTask : task
    ))
    setEditingTask(null)
  }

  const handleDuplicateTask = async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}/duplicate`, {
        method: 'POST',
      })

      if (response.ok) {
        const duplicatedTask = await response.json()
        toast.success('Task duplicated successfully')
        // Add the new task to the list
        setTasks(prev => [duplicatedTask.task, ...prev])
      } else {
        throw new Error('Failed to duplicate task')
      }
    } catch (error) {
      console.log("🚀 ~ handleDuplicateTask ~ error:", error)
      toast.error('Failed to duplicate task')
    }
  }

  const handleArchiveTask = async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ archived: true }),
      })

      if (response.ok) {
        toast.success('Task archived successfully')
        // Remove from current view
        setTasks(prev => prev.filter(task => task.id !== taskId))
      } else {
        throw new Error('Failed to archive task')
      }
    } catch (error) {
      console.log("🚀 ~ handleArchiveTask ~ error:", error)
      toast.error('Failed to archive task')
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Task deleted successfully')
        // Remove from current view
        setTasks(prev => prev.filter(task => task.id !== taskId))
      } else {
        throw new Error('Failed to delete task')
      }
    } catch (error) {
      console.log("🚀 ~ handleDeleteTask ~ error:", error)
      toast.error('Failed to delete task')
    }
  }
  return (
    <div className="space-y-4">
      {selectedTasks.length > 0 && (
        <div className="flex items-center space-x-2 p-2 bg-muted rounded-md">
          <span className="text-sm text-muted-foreground">
            {selectedTasks.length} task(s) selected
          </span>
          <Button variant="outline" size="sm" onClick={handleBulkEdit}>
            Bulk Edit
          </Button>
          <Button variant="outline" size="sm" onClick={handleBulkDelete}>
            Delete
          </Button>
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedTasks.length === filteredTasks.length && filteredTasks.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>
                <Button 
                  variant="ghost" 
                  onClick={() => handleSort("title")}
                  className="h-auto p-0 font-medium"
                >
                  Title
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Assignee</TableHead>
              <TableHead>
                <Button 
                  variant="ghost" 
                  onClick={() => handleSort("dueDate")}
                  className="h-auto p-0 font-medium"
                >
                  Due Date
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>              <TableHead>Story Points</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead>Activity</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              // Loading skeleton rows
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-12 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                </TableRow>
              ))            ) : (
              filteredTasks.map((task: TasksWithUsersAndTags) => (
                <TableRow key={task.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedTasks.includes(task.id)}
                    onCheckedChange={() => handleSelectTask(task.id)}
                  />
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="font-medium">{task.title}</div>
                    {task.description && (
                      <div className="text-sm text-muted-foreground line-clamp-1">
                        {task.description}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusColor(task.status)}>
                    {task.status.replace("_", " ")}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={getPriorityColor(task.priority)}>
                    {task.priority}
                  </Badge>
                </TableCell>
                <TableCell>
                  {task.assignee && (
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={task.assignee.image || ""} />                        <AvatarFallback className="text-xs">
                          {task.assignee.name?.slice(0, 2).toUpperCase() || "UN"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{task.assignee.name}</span>
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  {task.dueDate && (
                    <div className="text-sm">
                      {formatDistanceToNow(task.dueDate, { addSuffix: true })}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  {task.storyPoints && (
                    <Badge variant="outline">{task.storyPoints}</Badge>
                  )}
                </TableCell>
                <TableCell>                  <div className="flex flex-wrap gap-1">
                    {task.tags?.slice(0, 2).map((tag, index: number) => (
                      <Badge 
                        key={index} 
                        variant="outline" 
                        className="text-xs"
                        style={{ borderColor: tag.color || '#ccc', color: tag.color || '#666' }}
                      >
                        {tag.name}
                      </Badge>
                    ))}{task.tags && task.tags.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{task.tags.length - 2}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <MessageSquare className="h-3 w-3" />
                      <span>{task._count?.comments || 0}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Paperclip className="h-3 w-3" />
                      <span>{task._count?.attachments || 0}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEditTask(task.id)}>Edit</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDuplicateTask(task.id)}>Duplicate</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleArchiveTask(task.id)}>Archive</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDeleteTask(task.id)} className="text-destructive">
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>                </TableCell>
              </TableRow>
              ))
            )}
          </TableBody>        </Table>
      </div>
        {/* Edit Task Dialog */}
      {editingTask && (
        <TaskDialog
          mode="edit"
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          task={editingTask}
          onTaskUpdated={handleTaskUpdated}
        />
      )}
    </div>
  )
}

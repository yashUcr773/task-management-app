"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { TasksCalendar } from "@/components/tasks/tasks-calendar"
import { TasksWithUsersAndTags } from "@/types/all-types"
import { toast } from "sonner"
import { Task } from "@prisma/client"

export function CalendarView() {
  const router = useRouter()
  const [tasks, setTasks] = useState<TasksWithUsersAndTags[]>([])
  const [loading, setLoading] = useState(true)

  const fetchTasks = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/tasks')
      
      if (!response.ok) {
        throw new Error('Failed to fetch tasks')
      }

      const data = await response.json()
      
      // Transform the data to include proper date objects
      const tasksWithDates = data.tasks.map((task: Task) => ({
        ...task,
        dueDate: task.dueDate ? new Date(task.dueDate) : null,
        createdAt: new Date(task.createdAt),
        updatedAt: new Date(task.updatedAt)
      }))
      
      setTasks(tasksWithDates)
    } catch (error) {
      console.error("Error fetching tasks:", error)
      toast.error("Failed to load tasks")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [])
  const handleTaskClick = (task: TasksWithUsersAndTags) => {
    // Navigate to tasks page with the specific task selected
    router.push(`/tasks?taskId=${task.id}`)
  }

  const handleRefresh = () => {
    fetchTasks()
    toast.info('Refreshing calendar...')
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
            <p className="text-muted-foreground">
              View and manage your tasks in calendar format
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Calendar */}
      <div className="space-y-6">
        <TasksCalendar 
          tasks={tasks} 
          onTaskClick={handleTaskClick}
          isLoading={loading}
        />
      </div>
    </div>
  )
}

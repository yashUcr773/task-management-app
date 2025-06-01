"use client"

import { useState, useMemo, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { RefreshCw, Search, Wifi, WifiOff, AlertCircle } from "lucide-react"
import { TasksCalendar } from "@/components/tasks/tasks-calendar"
import { TasksWithUsersAndTags } from "@/types/all-types"
import { TaskFilters, FilterState } from "@/components/tasks/task-filters"
import { useRealTimeTasks } from "@/hooks/use-real-time-tasks"
import { useWebSocket } from "@/hooks/use-websocket"
import { TaskDialog } from "@/components/tasks/task-dialog"
import { toast } from "sonner"

export function CalendarView() {
  const router = useRouter()
  const searchParams = useSearchParams()
    const [searchQuery, setSearchQuery] = useState("")
  const [selectedTask, setSelectedTask] = useState<TasksWithUsersAndTags | null>(null)
  const [taskDialogOpen, setTaskDialogOpen] = useState(false)
  const [currentFilters, setCurrentFilters] = useState<FilterState>(() => ({
    status: searchParams?.get('status')?.split(',').filter(Boolean) || [],
    priority: searchParams?.get('priority')?.split(',').filter(Boolean) || [],
    assigneeId: searchParams?.get('assigneeId')?.split(',').filter(Boolean) || [],
    epicId: searchParams?.get('epicId')?.split(',').filter(Boolean) || [],
    sprintId: searchParams?.get('sprintId')?.split(',').filter(Boolean) || [],
    showArchived: searchParams?.get('showArchived') === 'true',
    overdue: searchParams?.get('filter') === 'overdue',
  }))
  
  // URL parameter filtering for backward compatibility
  const statusFilter = searchParams?.get('status')
  const filterParam = searchParams?.get('filter')
  
  // Determine real-time hook options based on current filters
  const hookOptions = useMemo(() => ({
    organizationId: 'org1', // This would come from context/props
    enableRealTime: true,
    showToasts: true,
    showArchived: currentFilters.showArchived,
    ...(currentFilters.status.length > 0 && { status: currentFilters.status }),
    ...(currentFilters.assigneeId.length > 0 && { assigneeId: currentFilters.assigneeId[0] }), // Use first selected assignee
    ...(currentFilters.epicId.length > 0 && { epicId: currentFilters.epicId[0] }), // Use first selected epic
    ...(currentFilters.sprintId.length > 0 && { sprintId: currentFilters.sprintId[0] }), // Use first selected sprint
  }), [currentFilters])

  // Real-time tasks hook with WebSocket integration
  const {
    tasks,
    isLoading,
    error,
    taskStats,
    overdueTasks,
    refreshTasks,
    lastUpdate,
    isRealTimeEnabled
  } = useRealTimeTasks(hookOptions)
  
  // WebSocket connection status
  const { isConnected } = useWebSocket()
  
  // Filter tasks based on current filters and search query
  const getFilteredTasks = () => {
    let filtered = tasks.filter((task: TasksWithUsersAndTags) =>
      task.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.assignee?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    
    // Apply priority filter
    if (currentFilters.priority.length > 0) {
      filtered = filtered.filter((task: TasksWithUsersAndTags) => 
        currentFilters.priority.includes(task.priority)
      )
    }
    
    // Apply overdue filter if specified
    if (currentFilters.overdue) {
      const now = new Date()
      filtered = filtered.filter((task: TasksWithUsersAndTags) => 
        task.dueDate && new Date(task.dueDate) < now && task.status !== 'RELEASED'
      )
    }
    
    // Apply legacy URL filter for backward compatibility
    if (filterParam === 'overdue') {
      const now = new Date()
      filtered = filtered.filter((task: TasksWithUsersAndTags) => 
        task.dueDate && new Date(task.dueDate) < now && task.status !== 'RELEASED'
      )
    }
    
    return filtered
  }
  
  const filteredTasks = getFilteredTasks()
  
  const handleTaskClick = (task: TasksWithUsersAndTags) => {
    // Open task dialog modal instead of navigating away
    setSelectedTask(task)
    setTaskDialogOpen(true)
  }

  const handleRefresh = () => {
    refreshTasks()
    toast.info('Refreshing calendar...')
  }

  const handleFiltersChange = useCallback((filters: FilterState) => {
    setCurrentFilters(filters)
  }, [])
  
  const clearFilters = () => {
    setCurrentFilters({
      status: [],
      priority: [],
      assigneeId: [],
      epicId: [],
      sprintId: [],
      showArchived: false,
      overdue: false,
    })
    router.push('/calendar')
  }
  
  const hasActiveFilters = !!(statusFilter || filterParam || 
    currentFilters.status.length > 0 ||
    currentFilters.priority.length > 0 ||
    currentFilters.assigneeId.length > 0 ||
    currentFilters.epicId.length > 0 ||
    currentFilters.sprintId.length > 0 ||
    currentFilters.showArchived ||
    currentFilters.overdue)

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
            <p className="text-muted-foreground">
              View and manage your tasks in calendar format
              {hasActiveFilters && (
                <span className="ml-2 text-blue-600">
                  • Filtered{statusFilter && ` by ${statusFilter.replace('_', ' ')}`}
                  {filterParam && ` (${filterParam})`}
                </span>
              )}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Task statistics */}
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <span>{taskStats.total} tasks</span>
            {overdueTasks.length > 0 && (
              <Badge variant="destructive" className="text-xs">
                <AlertCircle className="mr-1 h-3 w-3" />
                {overdueTasks.length} overdue
              </Badge>
            )}
          </div>
          
          {/* Real-time connection status and controls */}
          <div className="flex items-center space-x-2">
            {isConnected ? (
              <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                <Wifi className="mr-1 h-3 w-3" />
                Live
              </Badge>
            ) : (
              <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                <WifiOff className="mr-1 h-3 w-3" />
                Offline
              </Badge>
            )}
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
            <span className="text-red-800">{error}</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              className="ml-auto"
            >
              Retry
            </Button>
          </div>
        </div>
      )}

      {/* Real-time status indicator */}
      {lastUpdate && (
        <div className="text-xs text-muted-foreground">
          Last updated: {lastUpdate.toLocaleTimeString()}
          {isRealTimeEnabled && (
            <span className="ml-2">• Real-time enabled</span>
          )}
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
            <TaskFilters
            onFiltersChange={handleFiltersChange}
            hasActiveFilters={hasActiveFilters}
            onClearFilters={clearFilters}
            basePath="/calendar"
          />
        </div>
      </div>      {/* Calendar */}
      <div className="space-y-6">
        <TasksCalendar 
          tasks={filteredTasks} 
          onTaskClick={handleTaskClick}
          isLoading={isLoading}
        />
      </div>      {/* Task Edit Dialog */}
      <TaskDialog
        mode="edit"
        task={selectedTask}
        open={taskDialogOpen}
        onOpenChange={setTaskDialogOpen}
        onTaskUpdated={() => {
          // The real-time hook will automatically handle updates
          console.log("Task updated, real-time hook will handle refresh")
          setTaskDialogOpen(false)
        }}
      />
    </div>
  )
}

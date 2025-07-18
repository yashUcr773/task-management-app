"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { KanbanBoard } from "@/components/tasks/kanban-board"
import { TasksTable } from "@/components/tasks/tasks-table"
import { TasksList } from "@/components/tasks/tasks-list"
import { TaskDialog } from "@/components/tasks/task-dialog"
import { TaskDetailsModal } from "@/components/tasks/task-details-modal"
import { useRealTimeTasks } from "@/hooks/use-real-time-tasks"
import { useWebSocket } from "@/hooks/use-websocket"
import { TasksWithUsersAndTags } from "@/types/all-types"
import { 
  Plus, 
  Search,
  LayoutGrid,
  Table,
  List,
  Wifi,
  WifiOff,
  RefreshCw,
  AlertCircle,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { TaskFilters, FilterState } from "@/components/tasks/task-filters"
import { toast } from "sonner"

export function TasksView() {
  const searchParams = useSearchParams()
  const router = useRouter()
    const [createTaskOpen, setCreateTaskOpen] = useState(false)
  const [editTaskOpen, setEditTaskOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<TasksWithUsersAndTags | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [taskDetailsOpen, setTaskDetailsOpen] = useState(false)
  const [showArchived, setShowArchived] = useState(() => searchParams?.get('showArchived') === 'true')
  
  const [currentFilters, setCurrentFilters] = useState<FilterState>(() => ({
    status: searchParams?.get('status')?.split(',').filter(Boolean) || [],
    priority: searchParams?.get('priority')?.split(',').filter(Boolean) || [],
    assigneeId: searchParams?.get('assigneeId')?.split(',').filter(Boolean) || [],
    epicId: searchParams?.get('epicId')?.split(',').filter(Boolean) || [],
    sprintId: searchParams?.get('sprintId')?.split(',').filter(Boolean) || [],
    teamId: searchParams?.get('teamId')?.split(',').filter(Boolean) || [],
    showArchived: searchParams?.get('showArchived') === 'true',
    overdue: searchParams?.get('filter') === 'overdue',
  }))
  
  // URL parameter filtering
  const statusFilter = searchParams?.get('status')
  const filterParam = searchParams?.get('filter')
  const taskIdParam = searchParams?.get('id')
  const teamIdParam = searchParams?.get('teamId')
  
  // Determine real-time hook options based on current filters
  const hookOptions = useMemo(() => ({
    organizationId: 'org1', // This would come from context/props
    enableRealTime: true,
    showToasts: true,
    showArchived: currentFilters.showArchived,
    ...(teamIdParam && { teamId: teamIdParam }),
    ...(currentFilters.status.length > 0 && { status: currentFilters.status }),
    ...(currentFilters.assigneeId.length > 0 && { assigneeId: currentFilters.assigneeId[0] }), // Use first selected assignee
    ...(currentFilters.epicId.length > 0 && { epicId: currentFilters.epicId[0] }), // Use first selected epic
    ...(currentFilters.sprintId.length > 0 && { sprintId: currentFilters.sprintId[0] }), // Use first selected sprint
  }), [currentFilters, teamIdParam])// Real-time tasks hook with WebSocket integration
  const {
    tasks,
    isLoading,
    error,
    taskStats,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    tasksByStatus,
    overdueTasks,
    refreshTasks,
    lastUpdate,
    isRealTimeEnabled  } = useRealTimeTasks(hookOptions)
  
  // WebSocket connection status
  const { isConnected } = useWebSocket()
  
  // Handle URL parameters for task filtering and navigation
  useEffect(() => {
    if (taskIdParam) {
      setSelectedTaskId(taskIdParam)
      setTaskDetailsOpen(true)
    }
  }, [taskIdParam])
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
  
  const handleTaskSave = async () => {
    try {
      // For create mode, just refresh tasks since TaskDialog already created the task
      // Real-time hook will handle automatic updates, but refresh ensures consistency
      refreshTasks()
    } catch (error) {
      console.error('Failed to refresh tasks:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to refresh tasks')
    }
  }
  
  const handleTaskClick = (task: TasksWithUsersAndTags) => {
    setEditingTask(task)
    setEditTaskOpen(true)
  }
  const handleRefresh = () => {
    refreshTasks()
    toast.info('Refreshing tasks...')  
  }
    const handleFiltersChange = useCallback((filters: FilterState) => {
    setCurrentFilters(filters)
    // Sync showArchived state for backward compatibility
    setShowArchived(filters.showArchived)
  }, [])
  const clearFilters = () => {
    setCurrentFilters({
      status: [],
      priority: [],
      assigneeId: [],
      epicId: [],
      sprintId: [],
      teamId: [],
      showArchived: false,
      overdue: false,
    })
    setShowArchived(false)
    router.push('/tasks')
  }
  
  const hasActiveFilters = !!(statusFilter || filterParam || teamIdParam ||
    currentFilters.status.length > 0 ||
    currentFilters.priority.length > 0 ||
    currentFilters.assigneeId.length > 0 ||
    currentFilters.epicId.length > 0 ||
    currentFilters.sprintId.length > 0 ||
    currentFilters.teamId.length > 0 ||
    currentFilters.showArchived ||
    currentFilters.overdue)
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
            <p className="text-muted-foreground">
              Manage and track your tasks across projects
              {hasActiveFilters && (
                <span className="ml-2 text-blue-600">
                  • Filtered{statusFilter && ` by ${statusFilter.replace('_', ' ')}`}
                  {filterParam && ` (${filterParam})`}
                  {teamIdParam && ` by team`}
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

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
            />          </div>
          
          <TaskFilters
            onFiltersChange={handleFiltersChange}
            hasActiveFilters={hasActiveFilters}
            onClearFilters={clearFilters}
          />
          
          <Button 
            variant={showArchived ? "default" : "outline"} 
            size="sm"
            onClick={() => {
              const newShowArchived = !showArchived
              setShowArchived(newShowArchived)
              setCurrentFilters(prev => ({ ...prev, showArchived: newShowArchived }))
            }}
          >
            {showArchived ? "Hide Archived" : "Show Archived"}
          </Button>
          
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
          
          <Button onClick={() => setCreateTaskOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Task
          </Button>
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

      {/* View Tabs */}
      <Tabs defaultValue="kanban" className="space-y-4">        <TabsList>
          <TabsTrigger value="kanban" className="flex items-center space-x-2">
            <LayoutGrid className="h-4 w-4" />
            <span>Kanban</span>
          </TabsTrigger>
          <TabsTrigger value="table" className="flex items-center space-x-2">
            <Table className="h-4 w-4" />
            <span>Table</span>
          </TabsTrigger>
          <TabsTrigger value="list" className="flex items-center space-x-2">
            <List className="h-4 w-4" />
            <span>List</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="kanban" className="space-y-4">
          <KanbanBoard 
            searchQuery={searchQuery} 
            onTaskClick={handleTaskClick}
            tasks={filteredTasks}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="table" className="space-y-4">
          <TasksTable 
            searchQuery={searchQuery} 
            tasks={filteredTasks}
            isLoading={isLoading}
          />
        </TabsContent>        <TabsContent value="list" className="space-y-4">
          <TasksList 
            searchQuery={searchQuery}
            tasks={filteredTasks}
            isLoading={isLoading}
          />
        </TabsContent>
      </Tabs>        {/* Dialogs */}
      <TaskDialog 
        mode="create"
        open={createTaskOpen} 
        onOpenChange={setCreateTaskOpen}
        onSave={handleTaskSave}
      />

      <TaskDialog 
        mode="edit"
        open={editTaskOpen} 
        onOpenChange={setEditTaskOpen}
        task={editingTask}
        onTaskUpdated={() => {
          refreshTasks()
          setEditTaskOpen(false)
          setEditingTask(null)
        }}
      />

      <TaskDetailsModal
        taskId={selectedTaskId}
        open={taskDetailsOpen}
        onOpenChange={setTaskDetailsOpen}
        onTaskUpdate={() => {
          // The real-time hook will automatically handle updates
          console.log("Task updated, real-time hook will handle refresh")
        }}
      />
    </div>
  )
}

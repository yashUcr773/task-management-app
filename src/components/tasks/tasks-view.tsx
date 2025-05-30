"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { KanbanBoard } from "@/components/tasks/kanban-board"
import { TasksTable } from "@/components/tasks/tasks-table"
import { TasksList } from "@/components/tasks/tasks-list"
import {TasksCalendar} from "@/components/tasks/tasks-calendar"
import { CreateTaskDialog } from "@/components/tasks/create-task-dialog"
import { TaskDetailsModal } from "@/components/tasks/task-details-modal"
import { useRealTimeTasks } from "@/hooks/use-real-time-tasks"
import { useWebSocket } from "@/hooks/use-websocket"
import { 
  Plus, 
  Filter, 
  Search,
  LayoutGrid,
  Table,
  List,
  Calendar,
  Wifi,
  WifiOff,
  RefreshCw,
  AlertCircle
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

export function TasksView() {
  const [createTaskOpen, setCreateTaskOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [taskDetailsOpen, setTaskDetailsOpen] = useState(false)
    // Real-time tasks hook with WebSocket integration
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
    isRealTimeEnabled
  } = useRealTimeTasks({
    organizationId: 'org1', // This would come from context/props
    enableRealTime: true,
    showToasts: true
  })

  // WebSocket connection status
  const { isConnected } = useWebSocket()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
  const handleTaskSave = async (taskData: any) => {
    try {
      // In a real application, this would make an API call
      // For now, we'll just show a success message
      toast.success("Task created successfully!")
      setCreateTaskOpen(false)
      
      // The real-time hook will handle updates automatically
      // when the WebSocket receives the new task event
    } catch (error) {
      console.error('Failed to save task:', error)
      toast.error('Failed to create task')
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleTaskClick = (task: any) => {
    setSelectedTaskId(task.id)
    setTaskDetailsOpen(true)
  }

  const handleRefresh = () => {
    refreshTasks()
    toast.info('Refreshing tasks...')
  }
  // Filter tasks based on search query
  const filteredTasks = tasks.filter((task: any) =>
    task.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.assignee?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header Actions */}
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
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filter
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
      <Tabs defaultValue="kanban" className="space-y-4">
        <TabsList>
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
          <TabsTrigger value="calendar" className="flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span>Calendar</span>
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
        </TabsContent>

        <TabsContent value="list" className="space-y-4">
          <TasksList 
            searchQuery={searchQuery}
            tasks={filteredTasks}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="calendar" className="space-y-4">
          <TasksCalendar 
            tasks={filteredTasks}
            isLoading={isLoading}
          />
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <CreateTaskDialog 
        open={createTaskOpen} 
        onOpenChange={setCreateTaskOpen}
        onSave={handleTaskSave}
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

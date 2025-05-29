"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { KanbanBoard } from "@/components/tasks/kanban-board"
import { TasksTable } from "@/components/tasks/tasks-table"
import { TasksList } from "@/components/tasks/tasks-list"
import { TasksCalendar } from "@/components/tasks/tasks-calendar"
import { CreateTaskDialog } from "@/components/tasks/create-task-dialog"
import { TaskDetailsModal } from "@/components/tasks/task-details-modal"
import { 
  Plus, 
  Filter, 
  Search,
  LayoutGrid,
  Table,
  List,
  Calendar
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

export function TasksView() {
  const [createTaskOpen, setCreateTaskOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [taskDetailsOpen, setTaskDetailsOpen] = useState(false)

  const handleTaskSave = (taskData: any) => {
    // TODO: Implement actual API call to save task
    console.log("Saving task:", taskData)
    toast.success("Task created successfully!")
  }

  const handleTaskClick = (task: any) => {
    setSelectedTaskId(task.id)
    setTaskDetailsOpen(true)
  }

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
        </div>
        <Button onClick={() => setCreateTaskOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Task
        </Button>
      </div>

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
        </TabsList>        <TabsContent value="kanban" className="space-y-4">
          <KanbanBoard searchQuery={searchQuery} onTaskClick={handleTaskClick} />
        </TabsContent>

        <TabsContent value="table" className="space-y-4">
          <TasksTable searchQuery={searchQuery} />
        </TabsContent>

        <TabsContent value="list" className="space-y-4">
          <TasksList searchQuery={searchQuery} />
        </TabsContent>        <TabsContent value="calendar" className="space-y-4">
          <TasksCalendar 
            tasks={[]} // TODO: Pass actual tasks from API
            onTaskClick={handleTaskClick} 
          />
        </TabsContent>
      </Tabs>      <CreateTaskDialog 
        open={createTaskOpen} 
        onOpenChange={setCreateTaskOpen}
        onSave={handleTaskSave}
      />

      <TaskDetailsModal
        taskId={selectedTaskId}
        open={taskDetailsOpen}
        onOpenChange={setTaskDetailsOpen}
        onTaskUpdate={() => {
          // TODO: Refresh tasks data
          console.log("Task updated, refreshing data...")
        }}
      />
    </div>
  )
}

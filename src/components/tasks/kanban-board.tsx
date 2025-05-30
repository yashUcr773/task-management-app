"use client"

import React, { useState } from "react"
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { KanbanColumn } from "./kanban-column"
import { TaskCard } from "./task-card"
import { TaskStatus } from "@prisma/client"

// Mock data - will be replaced with real API calls
const mockTasks = [
  {
    id: "1",
    title: "Implement user authentication",
    description: "Set up NextAuth.js with Prisma adapter",
    status: "TODO" as TaskStatus,
    priority: "HIGH" as const,
    storyPoints: 8,
    dueDate: new Date("2025-06-01"),
    assignee: { name: "John Doe", email: "john@example.com", image: null },
    tags: [{ name: "Backend", color: "#3B82F6" }, { name: "Security", color: "#EF4444" }]
  },
  {
    id: "2", 
    title: "Design landing page",
    description: "Create responsive landing page with hero section",
    status: "IN_DEV" as TaskStatus,
    priority: "MEDIUM" as const,
    storyPoints: 5,
    dueDate: new Date("2025-05-30"),
    assignee: { name: "Jane Smith", email: "jane@example.com", image: null },
    tags: [{ name: "Frontend", color: "#10B981" }, { name: "Design", color: "#8B5CF6" }]
  },
  {
    id: "3",
    title: "Update API documentation", 
    description: "Document all REST endpoints with examples",
    status: "WITH_QA" as TaskStatus,
    priority: "LOW" as const,
    storyPoints: 3,
    dueDate: new Date("2025-06-03"),
    assignee: { name: "Mike Johnson", email: "mike@example.com", image: null },
    tags: [{ name: "Documentation", color: "#F59E0B" }]
  },
  {
    id: "4",
    title: "Setup CI/CD pipeline",
    description: "Configure GitHub Actions for automated testing and deployment",
    status: "READY" as TaskStatus,
    priority: "HIGH" as const,
    storyPoints: 13,
    dueDate: new Date("2025-06-05"),
    assignee: { name: "Sarah Wilson", email: "sarah@example.com", image: null },
    tags: [{ name: "DevOps", color: "#06B6D4" }]
  }
]

const columns = [
  { id: "PICKED", title: "Picked", color: "bg-blue-50 border-blue-200" },
  { id: "TODO", title: "To Do", color: "bg-gray-50 border-gray-200" },
  { id: "IN_DEV", title: "In Development", color: "bg-yellow-50 border-yellow-200" },
  { id: "WITH_QA", title: "With QA", color: "bg-purple-50 border-purple-200" },
  { id: "READY", title: "Ready", color: "bg-green-50 border-green-200" },
  { id: "AWAITING_INPUTS", title: "Awaiting Inputs", color: "bg-orange-50 border-orange-200" },
  { id: "RELEASED", title: "Released", color: "bg-emerald-50 border-emerald-200" }
]

interface KanbanBoardProps {
  searchQuery: string
  onTaskClick?: (task: any) => void
  tasks?: any[]
  isLoading?: boolean
}

export function KanbanBoard({ searchQuery, onTaskClick, tasks: externalTasks, isLoading }: KanbanBoardProps) {
  const [tasks, setTasks] = useState(externalTasks || mockTasks)
  const [activeTask, setActiveTask] = useState<typeof mockTasks[0] | null>(null)
  // Update tasks when external tasks change
  React.useEffect(() => {
    if (externalTasks) {
      setTasks(externalTasks)
    }
  }, [externalTasks])
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  const filteredTasks = tasks.filter(task => 
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.assignee?.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  function handleDragStart(event: DragStartEvent) {
    const task = tasks.find(t => t.id === event.active.id)
    setActiveTask(task || null)
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    
    if (!over) return

    const taskId = active.id as string
    const newStatus = over.id as TaskStatus

    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { ...task, status: newStatus }
        : task
    ))

    setActiveTask(null)
  }
  const getTasksByStatus = (status: string) => {
    return filteredTasks.filter(task => task.status === status)
  }

  if (isLoading) {
    return (
      <div className="flex gap-6 overflow-x-auto pb-4">
        {columns.map(column => (
          <div key={column.id} className="flex-shrink-0 w-80">
            <Card className={column.color}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-5 w-6 rounded-full" />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3 min-h-[200px]">
                  {[1, 2, 3].map(i => (
                    <Card key={i} className="p-3">
                      <Skeleton className="h-4 w-3/4 mb-2" />
                      <Skeleton className="h-3 w-1/2 mb-3" />
                      <div className="flex items-center justify-between">
                        <Skeleton className="h-6 w-16 rounded-full" />
                        <Skeleton className="h-6 w-6 rounded-full" />
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-6 overflow-x-auto pb-4">
        {columns.map(column => (
          <KanbanColumn
            key={column.id}
            id={column.id}
            title={column.title}
            color={column.color}
            tasks={getTasksByStatus(column.id)}
            onTaskClick={onTaskClick}
          />
        ))}
      </div>
      
      <DragOverlay>
        {activeTask && <TaskCard task={activeTask} isDragging />}
      </DragOverlay>
    </DndContext>
  )
}

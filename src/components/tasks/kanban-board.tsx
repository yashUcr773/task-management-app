"use client"

import React, { useState } from "react"
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { KanbanColumn } from "./kanban-column"
import { TaskCard } from "./task-card"
import { TaskStatus } from "@prisma/client"
import { TasksWithUsersAndTags } from "@/types/all-types"

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
  onTaskClick?: (task: TasksWithUsersAndTags) => void
  tasks?: TasksWithUsersAndTags[]
  isLoading?: boolean
}

export function KanbanBoard({ searchQuery, onTaskClick, tasks: externalTasks, isLoading }: KanbanBoardProps) {
  const [tasks, setTasks] = useState<TasksWithUsersAndTags[]>(externalTasks || [])
  const [activeTask, setActiveTask] = useState<TasksWithUsersAndTags | null>(null)
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
  
  const filteredTasks = tasks.filter((task: TasksWithUsersAndTags) => 
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (task.assignee?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
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

    setTasks((prev: TasksWithUsersAndTags[]) => prev.map((task: TasksWithUsersAndTags) => 
      task.id === taskId 
        ? { ...task, status: newStatus }
        : task
    ))

    setActiveTask(null)
  }
  
  const getTasksByStatus = (status: string) => {
    return filteredTasks.filter((task: TasksWithUsersAndTags) => task.status === status)
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

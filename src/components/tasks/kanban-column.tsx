"use client"

import { useDroppable } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TaskCard } from "./task-card"
import { TasksWithUsersAndTags } from "@/types/all-types"

interface KanbanColumnProps {
  id: string
  title: string
  color: string
  tasks: TasksWithUsersAndTags[]
  onTaskClick?: (task: TasksWithUsersAndTags) => void
}

export function KanbanColumn({ id, title, color, tasks, onTaskClick }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: id,
  })

  return (
    <div className="flex-shrink-0 w-80">
      <Card className={`h-full ${color} ${isOver ? 'ring-2 ring-blue-500' : ''}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Badge variant="secondary" className="text-xs">
              {tasks.length}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0  h-96 overflow-y-auto">
          <div
            ref={setNodeRef}
            className="space-y-3 min-h-[200px]"
          >
            <SortableContext 
              items={tasks.map(task => task.id)}
              strategy={verticalListSortingStrategy}
            >              {tasks.map(task => (
                <TaskCard key={task.id} task={task} onClick={onTaskClick} />
              ))}
            </SortableContext>
            {tasks.length === 0 && (
              <div className="text-center text-muted-foreground text-sm py-8">
                No tasks in this column
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

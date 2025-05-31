"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, MessageSquare, Paperclip } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { TasksWithUsersAndTags } from "@/types/all-types"

interface TaskCardProps {
  task: TasksWithUsersAndTags
  isDragging?: boolean
  onClick?: (task: TasksWithUsersAndTags) => void
}

export function TaskCard({ task, isDragging, onClick }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleClick = (e: React.MouseEvent) => {
    // Don't trigger click during drag operations
    if (!isDragging && !isSortableDragging && onClick) {
      e.stopPropagation()
      onClick(task)
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

  const isOverdue = task.dueDate && new Date() > task.dueDate

  if (isDragging || isSortableDragging) {
    return (
      <Card className="opacity-50 rotate-3 shadow-lg">
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <h4 className="font-medium text-sm leading-none">{task.title}</h4>
              <Badge variant={getPriorityColor(task.priority)} className="text-xs">
                {task.priority}
              </Badge>
            </div>
            {task.description && (
              <p className="text-xs text-muted-foreground line-clamp-2">
                {task.description}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="cursor-grab hover:shadow-md transition-shadow active:cursor-grabbing"
    >
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <h4 className="font-medium text-sm leading-none">{task.title}</h4>
            <Badge variant={getPriorityColor(task.priority)} className="text-xs">
              {task.priority}
            </Badge>
          </div>

          {task.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {task.description}
            </p>
          )}          {task.tags && task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {task.tags.slice(0, 2).map((tag, index) => (
                <Badge 
                  key={index} 
                  variant="outline" 
                  className="text-xs px-2 py-0"
                  style={{ 
                    borderColor: tag.color || "#ccc", 
                    color: tag.color || "#666" 
                  }}
                >
                  {tag.name}
                </Badge>
              ))}
              {task.tags.length > 2 && (
                <Badge variant="outline" className="text-xs px-2 py-0">
                  +{task.tags.length - 2}
                </Badge>
              )}
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">              {task.assignee && (
                <Avatar className="h-6 w-6">
                  <AvatarImage src={task.assignee.image || ""} />
                  <AvatarFallback className="text-xs">
                    {task.assignee.name?.slice(0, 2).toUpperCase() || "??"}
                  </AvatarFallback>
                </Avatar>
              )}
              {task.storyPoints && (
                <Badge variant="outline" className="text-xs">
                  {task.storyPoints} pts
                </Badge>
              )}
            </div>            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <MessageSquare className="h-3 w-3" />
              <span>{task._count?.comments || 0}</span>
              <Paperclip className="h-3 w-3" />
              <span>{task._count?.attachments || 0}</span>
            </div>
          </div>

          {task.dueDate && (
            <div className={`flex items-center space-x-1 text-xs ${
              isOverdue ? 'text-destructive' : 'text-muted-foreground'
            }`}>
              <Calendar className="h-3 w-3" />
              <span>
                Due {formatDistanceToNow(task.dueDate, { addSuffix: true })}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

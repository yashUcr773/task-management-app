"use client"

import { useState, useEffect, useCallback } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { VisuallyHidden } from "@/components/ui/visually-hidden"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Calendar,
  User,
  Users,
  Tag,
  Target,
  Timer,
  Edit,
  MoreHorizontal
} from "lucide-react"
import { TaskComments } from "./task-comments"
import TaskAttachments from "./task-attachments"
import { toast } from "sonner"
import { format } from "date-fns"

interface User {
  id: string
  name: string | null
  email: string
  image: string | null
}

interface Attachment {
  id: string;
  originalName: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  createdAt: string;
  uploader: {
    id: string;
    name: string;
    email: string;
  };
}

interface Team {
  id: string
  name: string
}

interface Epic {
  id: string
  title: string
}

interface Sprint {
  id: string
  name: string
}

interface TaskDetails {
  id: string
  title: string
  description: string | null
  status: string
  priority: string
  storyPoints: number | null
  dueDate: string | null
  shareableId: string
  isRecurring: boolean
  isArchived: boolean
  isBlocked: boolean
  createdAt: string
  updatedAt: string
  creator: User
  assignee: User | null
  team: Team
  epic: Epic | null
  sprint: Sprint | null
  tags: Array<{
    tag: {
      id: string
      name: string
      color: string | null
    }
  }>
}

interface TaskDetailsModalProps {
  taskId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onTaskUpdate?: () => void
}

const statusColors = {
  PICKED: "bg-orange-100 text-orange-800 border-orange-200",
  TODO: "bg-gray-100 text-gray-800 border-gray-200",
  IN_DEV: "bg-blue-100 text-blue-800 border-blue-200",
  WITH_QA: "bg-purple-100 text-purple-800 border-purple-200", 
  READY: "bg-green-100 text-green-800 border-green-200",
  AWAITING_INPUTS: "bg-yellow-100 text-yellow-800 border-yellow-200",
  RELEASED: "bg-emerald-100 text-emerald-800 border-emerald-200",
}

const priorityColors = {
  HIGH: "bg-red-100 text-red-800 border-red-200",
  MEDIUM: "bg-yellow-100 text-yellow-800 border-yellow-200",
  LOW: "bg-green-100 text-green-800 border-green-200",
}

export function TaskDetailsModal({ 
  taskId, 
  open, 
  onOpenChange, 
}: TaskDetailsModalProps) {
  const [task, setTask] = useState<TaskDetails | null>(null)
  const [loading, setLoading] = useState(false)
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [currentUserId, setCurrentUserId] = useState<string | undefined>()

  const fetchTaskDetails = useCallback(async () => {
    if (!taskId) return

    try {
      setLoading(true)
      
      // Fetch task details and attachments in parallel
      const [taskResponse, attachmentsResponse, userResponse] = await Promise.all([
        fetch(`/api/tasks/${taskId}`),
        fetch(`/api/tasks/${taskId}/attachments`),
        fetch('/api/user')
      ])

      if (!taskResponse.ok) {
        throw new Error("Failed to fetch task details")
      }

      const taskData = await taskResponse.json()
      setTask(taskData.task)

      // Handle attachments response
      if (attachmentsResponse.ok) {
        const attachmentsData = await attachmentsResponse.json()
        setAttachments(attachmentsData)
      } else {
        setAttachments([])
      }

      // Handle user response
      if (userResponse.ok) {
        const userData = await userResponse.json()
        setCurrentUserId(userData.id)
      }
    } catch (error) {
      console.error("Failed to fetch task details:", error)
      toast.error("Failed to load task details")
    } finally {
      setLoading(false)
    }
  }, [taskId])

  useEffect(() => {
    if (open && taskId) {
      fetchTaskDetails()
    }
  }, [open, taskId, fetchTaskDetails])


  const formatStatus = (status: string) => {
    return status.replace(/_/g, " ").toLowerCase().replace(/\\b\\w/g, l => l.toUpperCase())
  }

  const formatPriority = (priority: string) => {
    return priority.charAt(0) + priority.slice(1).toLowerCase()
  }

  if (!open || !taskId) {
    return null
  }
  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <VisuallyHidden>
              <DialogTitle>Loading Task Details</DialogTitle>
            </VisuallyHidden>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <div className="text-sm text-muted-foreground">Loading task details...</div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }
  if (!task) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <VisuallyHidden>
              <DialogTitle>Task Not Found</DialogTitle>
            </VisuallyHidden>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <div className="text-sm text-muted-foreground">Task not found</div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">
              {task.title}
            </DialogTitle>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <span>Created {format(new Date(task.createdAt), "MMM d, yyyy")}</span>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-6">
          <div className="space-y-6">
            {/* Status and Priority */}
            <div className="flex items-center space-x-4">
              <div className="space-y-1">
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Status
                </div>
                <Badge 
                  variant="outline" 
                  className={statusColors[task.status as keyof typeof statusColors]}
                >
                  {formatStatus(task.status)}
                </Badge>
              </div>
              <div className="space-y-1">
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Priority
                </div>
                <Badge 
                  variant="outline"
                  className={priorityColors[task.priority as keyof typeof priorityColors]}
                >
                  {formatPriority(task.priority)}
                </Badge>
              </div>
              {task.storyPoints && (
                <div className="space-y-1">
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Story Points
                  </div>
                  <Badge variant="outline">
                    {task.storyPoints}
                  </Badge>
                </div>
              )}
            </div>

            {/* Description */}
            {task.description && (
              <div className="space-y-2">
                <div className="text-sm font-medium">Description</div>
                <div className="text-sm text-muted-foreground whitespace-pre-wrap bg-muted/50 rounded-md p-3">
                  {task.description}
                </div>
              </div>
            )}

            {/* Assignee and Team */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-sm font-medium flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  Assignee
                </div>
                {task.assignee ? (
                  <div className="flex items-center space-x-2">
                    <div className="text-sm">{task.assignee.name || task.assignee.email}</div>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">Unassigned</div>
                )}
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  Team
                </div>
                <div className="text-sm">{task.team.name}</div>
              </div>
            </div>

            {/* Epic and Sprint */}
            {(task.epic || task.sprint) && (
              <div className="grid grid-cols-2 gap-4">
                {task.epic && (
                  <div className="space-y-2">
                    <div className="text-sm font-medium flex items-center">
                      <Target className="h-4 w-4 mr-2" />
                      Epic
                    </div>
                    <div className="text-sm">{task.epic.title}</div>
                  </div>
                )}
                {task.sprint && (
                  <div className="space-y-2">
                    <div className="text-sm font-medium flex items-center">
                      <Timer className="h-4 w-4 mr-2" />
                      Sprint
                    </div>
                    <div className="text-sm">{task.sprint.name}</div>
                  </div>
                )}
              </div>
            )}

            {/* Due Date */}
            {task.dueDate && (
              <div className="space-y-2">
                <div className="text-sm font-medium flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  Due Date
                </div>
                <div className="text-sm">
                  {format(new Date(task.dueDate), "MMM d, yyyy 'at' h:mm a")}
                </div>
              </div>
            )}

            {/* Tags */}
            {task.tags.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm font-medium flex items-center">
                  <Tag className="h-4 w-4 mr-2" />
                  Tags
                </div>
                <div className="flex flex-wrap gap-2">
                  {task.tags.map((taskTag) => (
                    <Badge
                      key={taskTag.tag.id}
                      variant="secondary"
                      style={{
                        backgroundColor: taskTag.tag.color ? `${taskTag.tag.color}20` : undefined,
                        borderColor: taskTag.tag.color || undefined,
                      }}
                    >
                      {taskTag.tag.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Metadata */}
            <div className="space-y-2">
              <div className="text-sm font-medium">Details</div>
              <div className="text-xs text-muted-foreground space-y-1">
                <div>Created by {task.creator.name || task.creator.email}</div>
                <div>Last updated {format(new Date(task.updatedAt), "MMM d, yyyy 'at' h:mm a")}</div>
                {task.isBlocked && (
                  <div className="text-red-600">⚠️ This task is blocked</div>
                )}
                {task.isRecurring && (
                  <div className="text-blue-600">🔄 This is a recurring task</div>
                )}
              </div>            </div>

            <Separator />

            {/* Attachments Section */}
            <TaskAttachments
              taskId={task.id}
              attachments={attachments}
              onAttachmentsChange={setAttachments}
              currentUserId={currentUserId}
            />

            <Separator />

            {/* Comments Section */}
            <TaskComments taskId={task.id} />
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

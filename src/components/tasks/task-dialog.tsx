"use client"

import React, { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, X, Plus, User, Settings, MessageSquare, Paperclip } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { AttachmentWithUser, TasksWithUsersAndTags } from "@/types/all-types"
import { Priority,  TaskStatus } from "@prisma/client"
import { TaskComments } from "./task-comments"
import TaskAttachments from "./task-attachments"

const taskFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must be less than 100 characters"),
  description: z.string().optional(),
  status: z.enum(["PICKED", "TODO", "IN_DEV", "WITH_QA", "READY", "AWAITING_INPUTS", "RELEASED"]),
  priority: z.enum(["HIGH", "MEDIUM", "LOW"]),
  storyPoints: z.number().min(0).max(100).optional(),
  dueDate: z.date().optional(),
  assigneeId: z.string().optional(),
  epicId: z.string().optional(),
  sprintId: z.string().optional(),
  tags: z.array(z.object({
    name: z.string(),
    color: z.string()
  })).optional(),
})

type TaskFormValues = z.infer<typeof taskFormSchema>

interface User {
  id: string
  name: string
  email: string
  image?: string | null
}

interface Epic {
  id: string
  title: string
  color: string
}

interface Sprint {
  id: string
  name: string
  startDate: Date
  endDate: Date
}

interface TaskDialogProps {
  mode: "create" | "edit"
  open: boolean
  onOpenChange: (open: boolean) => void
  task?: TasksWithUsersAndTags | null
  onSave?: (task: {
    title: string;
    description?: string;
    status: string;
    priority: string;
    storyPoints?: number;
    dueDate?: Date;
    assigneeId?: string;
    epicId?: string;
    sprintId?: string;
    tags?: Array<{ name: string; color: string }>;
  }) => void
  onTaskUpdated?: (updatedTask: TasksWithUsersAndTags) => void
}

export function TaskDialog({ 
  mode, 
  open, 
  onOpenChange, 
  task, 
  onTaskUpdated 
}: TaskDialogProps) {
  const [newTagName, setNewTagName] = useState("")
  const [selectedTags, setSelectedTags] = useState<Array<{ name: string; color: string }>>([])
  const [isLoading, setIsLoading] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [epics, setEpics] = useState<Epic[]>([])
  const [sprints, setSprints] = useState<Sprint[]>([])
  const [activeTab, setActiveTab] = useState("details")
  const [createdTaskId, setCreatedTaskId] = useState<string | null>(null)
  const [attachments, setAttachments] = useState<AttachmentWithUser[]>([])
  const [defaultTags] = useState([
    { name: "Frontend", color: "#3b82f6" },
    { name: "Backend", color: "#10b981" },
    { name: "Bug", color: "#ef4444" },
    { name: "Feature", color: "#8b5cf6" },
    { name: "Documentation", color: "#f59e0b" },
  ])

  const isEditing = mode === "edit"
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: "",
      description: "",
      status: "TODO",
      priority: "MEDIUM",
      storyPoints: undefined,
      dueDate: undefined,
      assigneeId: "unassigned",
      epicId: "no-epic",
      sprintId: "no-sprint",
      tags: [],
    },
  })
  // Reset form when task changes or dialog opens
  useEffect(() => {
    if (open) {
      setActiveTab("details")
      setCreatedTaskId(null)
      setAttachments([])
      
      if (isEditing && task) {
        const taskTags = task.tags?.map(t => ({
          name: t.name,
          color: t.color || "#6b7280"
        })) || []
        
        setSelectedTags(taskTags)
          form.reset({
          title: task.title,
          description: task.description || "",
          status: task.status as TaskStatus,
          priority: task.priority as Priority,
          storyPoints: task.storyPoints || undefined,
          dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
          assigneeId: task.assigneeId || "unassigned",
          epicId: task.epicId || "no-epic",
          sprintId: task.sprintId || "no-sprint",
          tags: taskTags,
        })      } else {
        // Reset for create mode
        setSelectedTags([])
        form.reset({
          title: "",
          description: "",
          status: "TODO",
          priority: "MEDIUM",
          storyPoints: undefined,
          dueDate: undefined,
          assigneeId: "unassigned",
          epicId: "no-epic",
          sprintId: "no-sprint",
          tags: [],
        })
      }
    }
  }, [open, task, isEditing, form])

  // Fetch real data from APIs
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch users
        const usersResponse = await fetch('/api/user/list')
        if (usersResponse.ok) {
          const usersData = await usersResponse.json()
          setUsers(usersData.users || [])
        }

        // Fetch epics
        const epicsResponse = await fetch('/api/epics')
        if (epicsResponse.ok) {
          const epicsData = await epicsResponse.json()
          setEpics(epicsData.epics || [])
        }

        // Fetch sprints
        const sprintsResponse = await fetch('/api/sprints')
        if (sprintsResponse.ok) {
          const sprintsData = await sprintsResponse.json()
          setSprints(sprintsData.sprints || [])
        }
      } catch (error) {
        console.error('Failed to fetch dialog data:', error)
        // Continue with empty arrays if API calls fail
      }
    }

    if (open) {
      fetchData()
    }
  }, [open])

  const onSubmit = async (data: TaskFormValues) => {
    setIsLoading(true)
    try {
      const formattedData = {
        ...data,
        // Convert empty string values to null for proper API handling
        assigneeId: data.assigneeId === "" || data.assigneeId === "unassigned" ? null : data.assigneeId,        
        epicId: data.epicId === "" || data.epicId === "no-epic" ? null : data.epicId,
        sprintId: data.sprintId === "" || data.sprintId === "no-sprint" ? null : data.sprintId,
        storyPoints: data.storyPoints === undefined || data.storyPoints === 0 ? null : data.storyPoints,
        dueDate: data.dueDate ? data.dueDate.toISOString() : null,
        tags: selectedTags,
      }

      const url = isEditing ? `/api/tasks/${task?.id}` : '/api/tasks'
      const method = isEditing ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedData),
      })

      if (response.ok) {
        const result = await response.json()
        toast.success(isEditing ? "Task updated successfully!" : "Task created successfully!")
        
        if (isEditing && onTaskUpdated) {
          onTaskUpdated(result.task)
          onOpenChange(false)
        } else {
          // For create mode, set the created task ID so comments/attachments can be added
          setCreatedTaskId(result.task.id)
          setActiveTab("comments") // Switch to comments tab after creation
        }
        
        // Reset form and tags for create mode
        if (!isEditing) {
          form.reset()
          setSelectedTags([])
        }
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || `Failed to ${isEditing ? 'update' : 'create'} task`)
      }
    } catch (error) {
      console.error(`Error ${isEditing ? 'updating' : 'creating'} task:`, error)
      toast.error(`Failed to ${isEditing ? 'update' : 'create'} task`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddCustomTag = () => {
    if (newTagName.trim() && !selectedTags.find(tag => tag.name === newTagName.trim())) {
      const newTag = {
        name: newTagName.trim(),
        color: defaultTags.find(tag => tag.name === newTagName.trim())?.color || "#6b7280"
      }
      setSelectedTags([...selectedTags, newTag])
      form.setValue("tags", [...selectedTags, newTag])
      setNewTagName("")
    }
  }

  const handleRemoveTag = (tagName: string) => {
    const updatedTags = selectedTags.filter(tag => tag.name !== tagName)
    setSelectedTags(updatedTags)
    form.setValue("tags", updatedTags)
  }
  const handleSelectDefaultTag = (tag: { name: string; color: string }) => {
    if (!selectedTags.find(t => t.name === tag.name)) {
      const updatedTags = [...selectedTags, tag]
      setSelectedTags(updatedTags)
      form.setValue("tags", updatedTags)
    }
  }

  const handleAttachmentsChange = (newAttachments: AttachmentWithUser[]) => {
    setAttachments(newAttachments)
  }

  const getCurrentTaskId = () => {
    return isEditing ? task?.id : createdTaskId
  }

  const canShowCommentsAndAttachments = () => {
    return isEditing || createdTaskId
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">        
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Task" : "Create New Task"}</DialogTitle>
          <DialogDescription>
            {isEditing 
              ? "Update the task details below." 
              : createdTaskId 
                ? "Task created successfully! You can now add comments and attachments."
                : "Fill in the details to create a new task."
            }
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Details
            </TabsTrigger>
            <TabsTrigger 
              value="comments" 
              disabled={!canShowCommentsAndAttachments()}
              className="flex items-center gap-2"
            >
              <MessageSquare className="h-4 w-4" />
              Comments
            </TabsTrigger>
            <TabsTrigger 
              value="attachments" 
              disabled={!canShowCommentsAndAttachments()}
              className="flex items-center gap-2"
            >
              <Paperclip className="h-4 w-4" />
              Attachments
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="mt-6">
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter task title..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter task description..." 
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Status and Priority Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="PICKED">Picked</SelectItem>
                        <SelectItem value="TODO">To Do</SelectItem>
                        <SelectItem value="IN_DEV">In Development</SelectItem>
                        <SelectItem value="WITH_QA">With QA</SelectItem>
                        <SelectItem value="READY">Ready</SelectItem>
                        <SelectItem value="AWAITING_INPUTS">Awaiting Inputs</SelectItem>
                        <SelectItem value="RELEASED">Released</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="HIGH">
                          <div className="flex items-center">
                            <div className="w-2 h-2 rounded-full bg-red-500 mr-2" />
                            High
                          </div>
                        </SelectItem>
                        <SelectItem value="MEDIUM">
                          <div className="flex items-center">
                            <div className="w-2 h-2 rounded-full bg-yellow-500 mr-2" />
                            Medium
                          </div>
                        </SelectItem>
                        <SelectItem value="LOW">
                          <div className="flex items-center">
                            <div className="w-2 h-2 rounded-full bg-green-500 mr-2" />
                            Low
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Story Points and Due Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="storyPoints"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Story Points</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="0" 
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormDescription>Optional estimation in story points</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date(new Date().setHours(0, 0, 0, 0))
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Assignee */}
            <FormField
              control={form.control}
              name="assigneeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assignee</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select assignee" />
                      </SelectTrigger>
                    </FormControl>                    <SelectContent>
                      <SelectItem value="unassigned">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Unassigned
                        </div>
                      </SelectItem>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-5 w-5">
                              <AvatarImage src={user.image || ""} />
                              <AvatarFallback>
                                {user.name?.charAt(0) || user.email.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span>{user.name || user.email}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Epic and Sprint */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="epicId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Epic</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select epic" />
                        </SelectTrigger>
                      </FormControl>                      <SelectContent>
                        <SelectItem value="no-epic">No Epic</SelectItem>
                        {epics.map((epic) => (
                          <SelectItem key={epic.id} value={epic.id}>
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: epic.color }}
                              />
                              {epic.title}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sprintId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sprint</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select sprint" />
                        </SelectTrigger>
                      </FormControl>                      <SelectContent>
                        <SelectItem value="no-sprint">No Sprint</SelectItem>
                        {sprints.map((sprint) => (
                          <SelectItem key={sprint.id} value={sprint.id}>
                            <div>
                              <div className="font-medium">{sprint.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {format(sprint.startDate, "MMM d")} - {format(sprint.endDate, "MMM d")}
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Tags */}
            <div className="space-y-4">
              <FormLabel>Tags</FormLabel>
              
              {/* Selected Tags */}
              {selectedTags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedTags.map((tag, index) => (
                    <Badge 
                      key={index} 
                      variant="secondary" 
                      className="px-2 py-1"
                      style={{ 
                        backgroundColor: `${tag.color}20`,
                        color: tag.color,
                        borderColor: tag.color
                      }}
                    >
                      {tag.name}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag.name)}
                        className="ml-1 hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}

              {/* Add Custom Tag */}
              <div className="flex gap-2">
                <Input
                  placeholder="Add custom tag..."
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddCustomTag()
                    }
                  }}
                />
                <Button 
                  type="button" 
                  variant="outline"
                  size="sm"
                  onClick={handleAddCustomTag}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* Default Tags */}
              <div className="space-y-2">
                <FormDescription>Quick add from common tags:</FormDescription>
                <div className="flex flex-wrap gap-2">
                  {defaultTags.map((tag: { name: string; color: string }) => (
                    <button
                      key={tag.name}
                      type="button"
                      onClick={() => handleSelectDefaultTag(tag)}
                      disabled={!!selectedTags.find(t => t.name === tag.name)}
                      className="text-xs px-2 py-1 rounded border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ 
                        borderColor: tag.color,
                        color: tag.color 
                      }}
                    >
                      {tag.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? `${isEditing ? 'Updating' : 'Creating'}...` : `${isEditing ? 'Update' : 'Create'} Task`}
              </Button>
            </DialogFooter>
          </form>
        </Form>
          </TabsContent>          <TabsContent value="comments" className="mt-6">
            {canShowCommentsAndAttachments() && getCurrentTaskId() ? (
              <div className="space-y-4">
                <TaskComments taskId={getCurrentTaskId()!} />
                {!isEditing && (
                  <div className="flex justify-end pt-4 border-t">
                    <Button onClick={() => onOpenChange(false)}>
                      Finish
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Comments will be available after the task is created.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="attachments" className="mt-6">
            {canShowCommentsAndAttachments() && getCurrentTaskId() ? (
              <div className="space-y-4">
                <TaskAttachments
                  taskId={getCurrentTaskId()!}
                  attachments={attachments}
                  onAttachmentsChange={handleAttachmentsChange}
                />
                {!isEditing && (
                  <div className="flex justify-end pt-4 border-t">
                    <Button onClick={() => onOpenChange(false)}>
                      Finish
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Paperclip className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Attachments will be available after the task is created.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

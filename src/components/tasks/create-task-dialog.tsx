"use client"

import React, { useState } from "react"
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
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, X, Plus, User } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

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

interface CreateTaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  task?: any // For editing existing tasks
  onSave: (task: TaskFormValues) => void
}

// Replace with actual API calls to fetch users, epics, sprints, and tags

export function CreateTaskDialog({ open, onOpenChange, task, onSave }: CreateTaskDialogProps) {
  const [newTagName, setNewTagName] = useState("")
  const [selectedTags, setSelectedTags] = useState<Array<{ name: string; color: string }>>(
    task?.tags || []
  )
  const [isLoading, setIsLoading] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [epics, setEpics] = useState<Epic[]>([])
  const [sprints, setSprints] = useState<Sprint[]>([])
  const [defaultTags] = useState([
    { name: "Frontend", color: "#3b82f6" },
    { name: "Backend", color: "#10b981" },
    { name: "Bug", color: "#ef4444" },
    { name: "Feature", color: "#8b5cf6" },
    { name: "Documentation", color: "#f59e0b" },
  ])
  
  const isEditing = !!task

  // Fetch real data from APIs
  React.useEffect(() => {
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

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: task?.title || "",
      description: task?.description || "",
      status: task?.status || "TODO",
      priority: task?.priority || "MEDIUM",
      storyPoints: task?.storyPoints || undefined,
      dueDate: task?.dueDate || undefined,
      assigneeId: task?.assigneeId || "",
      epicId: task?.epicId || "",
      sprintId: task?.sprintId || "",
      tags: task?.tags || [],
    },
  })
  const onSubmit = async (values: TaskFormValues) => {
    setIsLoading(true)
    try {
      const taskData = {
        ...values,
        // Convert special values back to null/undefined
        assigneeId: values.assigneeId === "unassigned" ? undefined : values.assigneeId,
        epicId: values.epicId === "no-epic" ? undefined : values.epicId,
        sprintId: values.sprintId === "no-sprint" ? undefined : values.sprintId,
        tags: selectedTags,
        dueDate: values.dueDate?.toISOString(),
      }

      const response = await fetch(isEditing ? `/api/tasks/${task.id}` : '/api/tasks', {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save task')
      }

      onSave(result.task)
      onOpenChange(false)
      form.reset()
      setSelectedTags([])
      toast.success(isEditing ? "Task updated successfully!" : "Task created successfully!")
    } catch (error) {
      console.error("Error saving task:", error)
      toast.error(error instanceof Error ? error.message : "Failed to save task")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddTag = () => {
    if (newTagName.trim() && !selectedTags.find(tag => tag.name === newTagName.trim())) {
      const newTag = {
        name: newTagName.trim(),
        color: defaultTags.find(tag => tag.name === newTagName.trim())?.color || "#6b7280"
      }
      setSelectedTags([...selectedTags, newTag])
      setNewTagName("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setSelectedTags(selectedTags.filter(tag => tag.name !== tagToRemove))
  }

  const handleSelectDefaultTag = (tag: { name: string; color: string }) => {
    if (!selectedTags.find(t => t.name === tag.name)) {
      setSelectedTags([...selectedTags, tag])
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Task" : "Create New Task"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Update the task details below." : "Fill in the details to create a new task."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="PICKED">Picked</SelectItem>
                        <SelectItem value="TODO">Todo</SelectItem>
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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

            {/* Story Points and Due Date Row */}
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
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
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
                            variant="outline"
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
                          onSelect={field.onChange}                          disabled={(date: Date) =>
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
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select assignee" />
                      </SelectTrigger>
                    </FormControl>                    <SelectContent>
                      <SelectItem value="unassigned">
                        <div className="flex items-center">
                          <User className="mr-2 h-4 w-4 text-muted-foreground" />
                          Unassigned
                        </div>
                      </SelectItem>
                      {users.map((user: User) => (
                        <SelectItem key={user.id} value={user.id}>
                          <div className="flex items-center">
                            <Avatar className="mr-2 h-6 w-6">
                              <AvatarImage src={user.image || undefined} />
                              <AvatarFallback className="text-xs">
                                {user.name.split(' ').map((n: string) => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <span>{user.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Epic and Sprint Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="epicId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Epic</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select epic" />
                        </SelectTrigger>
                      </FormControl>                      <SelectContent>
                        <SelectItem value="no-epic">No Epic</SelectItem>
                        {epics.map((epic: Epic) => (
                          <SelectItem key={epic.id} value={epic.id}>
                            <div className="flex items-center">
                              <div 
                                className="w-3 h-3 rounded mr-2" 
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select sprint" />
                        </SelectTrigger>
                      </FormControl>                      <SelectContent>
                        <SelectItem value="no-sprint">No Sprint</SelectItem>
                        {sprints.map((sprint: Sprint) => (
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
            <div className="space-y-3">
              <FormLabel>Tags</FormLabel>
              
              {/* Selected Tags */}
              {selectedTags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedTags.map((tag) => (
                    <Badge 
                      key={tag.name} 
                      variant="secondary" 
                      className="flex items-center gap-1"
                      style={{ backgroundColor: tag.color + '20', color: tag.color }}
                    >
                      {tag.name}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag.name)}
                        className="ml-1 hover:bg-black/20 rounded-full p-0.5"
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
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                />
                <Button type="button" variant="outline" size="sm" onClick={handleAddTag}>
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
            </div>

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : (isEditing ? "Update Task" : "Create Task")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

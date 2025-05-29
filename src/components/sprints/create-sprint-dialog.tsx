"use client"

import { useState, useEffect } from "react"
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
import { Button } from "@/components/ui/button"
import { Calendar, Users } from "lucide-react"
import { toast } from "sonner"

const sprintFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  teamId: z.string().min(1, "Team is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
}).refine((data) => {
  const startDate = new Date(data.startDate)
  const endDate = new Date(data.endDate)
  return startDate < endDate
}, {
  message: "End date must be after start date",
  path: ["endDate"],
})

type SprintFormValues = z.infer<typeof sprintFormSchema>

interface Team {
  id: string
  name: string
  organization: {
    id: string
    name: string
  }
}

interface Sprint {
  id: string
  name: string
  teamId: string
  startDate: string
  endDate: string
}

interface CreateSprintDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sprint?: Sprint | null
  onSave: (data: SprintFormValues) => void
}

export function CreateSprintDialog({ open, onOpenChange, sprint, onSave }: CreateSprintDialogProps) {
  const [teams, setTeams] = useState<Team[]>([])
  const [loadingTeams, setLoadingTeams] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const isEditing = !!sprint

  const form = useForm<SprintFormValues>({
    resolver: zodResolver(sprintFormSchema),
    defaultValues: {
      name: "",
      teamId: "",
      startDate: "",
      endDate: "",
    },
  })

  useEffect(() => {
    if (open) {
      fetchTeams()
      
      if (sprint) {
        // Format dates for HTML input (YYYY-MM-DD)
        const startDate = new Date(sprint.startDate).toISOString().split('T')[0]
        const endDate = new Date(sprint.endDate).toISOString().split('T')[0]
        
        form.reset({
          name: sprint.name,
          teamId: sprint.teamId,
          startDate,
          endDate,
        })
      } else {
        // Set default dates (start: today, end: 2 weeks from today)
        const today = new Date()
        const twoWeeksFromNow = new Date()
        twoWeeksFromNow.setDate(today.getDate() + 14)
        
        form.reset({
          name: "",
          teamId: "",
          startDate: today.toISOString().split('T')[0],
          endDate: twoWeeksFromNow.toISOString().split('T')[0],
        })
      }
    }
  }, [open, sprint, form])

  const fetchTeams = async () => {
    setLoadingTeams(true)
    try {
      const response = await fetch('/api/teams')
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch teams')
      }

      setTeams(result.teams)
    } catch (error) {
      console.error("Error fetching teams:", error)
      toast.error("Failed to load teams")
    } finally {
      setLoadingTeams(false)
    }
  }

  const onSubmit = async (data: SprintFormValues) => {
    setIsLoading(true)
    try {
      await onSave(data)
    } catch (error) {
      // Error handling is done in the parent component
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>{isEditing ? "Edit Sprint" : "Create New Sprint"}</span>
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? "Update sprint details and manage team deliverables."
              : "Create a new sprint to organize your team's work for a specific time period."
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sprint Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter sprint name..." 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    e.g., "Sprint 1", "Feature Development Sprint", "Bug Fix Sprint"
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="teamId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Team</FormLabel>
                  <FormControl>
                    <Select
                      disabled={loadingTeams || isEditing}
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={
                          loadingTeams ? "Loading teams..." : "Select team"
                        } />
                      </SelectTrigger>
                      <SelectContent>
                        {teams.map((team) => (
                          <SelectItem key={team.id} value={team.id}>
                            <div className="flex items-center space-x-2">
                              <Users className="h-4 w-4" />
                              <div>
                                <div className="font-medium">{team.name}</div>
                                <div className="text-xs text-muted-foreground">
                                  {team.organization.name}
                                </div>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormDescription>
                    {isEditing 
                      ? "Team cannot be changed after creation"
                      : "Select the team this sprint belongs to"
                    }
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input 
                        type="date"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date</FormLabel>
                    <FormControl>
                      <Input 
                        type="date"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : (isEditing ? "Update Sprint" : "Create Sprint")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

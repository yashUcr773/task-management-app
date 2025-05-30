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
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Building, BookOpen } from "lucide-react"
import { toast } from "sonner"

const epicFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must be less than 100 characters"),
  description: z.string().optional(),
  organizationId: z.string().min(1, "Organization is required"),
})

type EpicFormValues = z.infer<typeof epicFormSchema>

interface Organization {
  id: string
  name: string
  description?: string
}

interface Epic {
  id: string
  title: string
  description?: string
  organizationId: string
}

interface CreateEpicDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  epic?: Epic | null
  onSave: (data: EpicFormValues) => void
}

export function CreateEpicDialog({ open, onOpenChange, epic, onSave }: CreateEpicDialogProps) {
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [loadingOrgs, setLoadingOrgs] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const isEditing = !!epic

  const form = useForm<EpicFormValues>({
    resolver: zodResolver(epicFormSchema),
    defaultValues: {
      title: "",
      description: "",
      organizationId: "",
    },
  })

  useEffect(() => {
    if (open) {
      fetchOrganizations()
      
      if (epic) {
        form.reset({
          title: epic.title,
          description: epic.description || "",
          organizationId: epic.organizationId,
        })
      } else {
        form.reset({
          title: "",
          description: "",
          organizationId: "",
        })
      }
    }
  }, [open, epic, form])

  const fetchOrganizations = async () => {
    setLoadingOrgs(true)
    try {
      const response = await fetch('/api/organizations')
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch organizations')
      }

      setOrganizations(result.organizations)
    } catch (error) {
      console.error("Error fetching organizations:", error)
      toast.error("Failed to load organizations")
    } finally {
      setLoadingOrgs(false)
    }
  }
  const onSubmit = async (data: EpicFormValues) => {
    setIsLoading(true)
    try {
      await onSave(data)
    } catch {
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
            <BookOpen className="h-5 w-5" />
            <span>{isEditing ? "Edit Epic" : "Create New Epic"}</span>
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? "Update epic details and track progress across teams."
              : "Create a new epic to organize your work and track progress across teams."
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter epic title..." 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the epic objectives and scope..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Provide a clear description of what this epic aims to achieve
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="organizationId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organization</FormLabel>
                  <FormControl>
                    <Select
                      disabled={loadingOrgs || isEditing}
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={
                          loadingOrgs ? "Loading organizations..." : "Select organization"
                        } />
                      </SelectTrigger>
                      <SelectContent>
                        {organizations.map((org) => (
                          <SelectItem key={org.id} value={org.id}>
                            <div className="flex items-center space-x-2">
                              <Building className="h-4 w-4" />
                              <span>{org.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormDescription>
                    {isEditing 
                      ? "Organization cannot be changed after creation"
                      : "Select the organization this epic belongs to"
                    }
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                {isLoading ? "Saving..." : (isEditing ? "Update Epic" : "Create Epic")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

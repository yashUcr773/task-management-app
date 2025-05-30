"use client"

import { useState, useEffect, useCallback } from "react"
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, X, Plus, Building } from "lucide-react"
import { toast } from "sonner"

const teamFormSchema = z.object({
  name: z.string().min(1, "Team name is required").max(100, "Team name must be less than 100 characters"),
  description: z.string().optional(),
  organizationId: z.string().min(1, "Organization is required"),
  memberIds: z.array(z.string()).optional(),
})

type TeamFormValues = z.infer<typeof teamFormSchema>

interface User {
  id: string
  name: string
  email: string
  image?: string | null
}

interface Organization {
  id: string
  name: string
  description?: string
}

interface CreateTeamDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  team?: any // For editing existing teams
  onSave: (team: TeamFormValues) => void
}

export function CreateTeamDialog({ open, onOpenChange, team, onSave }: CreateTeamDialogProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedMembers, setSelectedMembers] = useState<User[]>(team?.members?.map((m: any) => m.user) || [])
  const [isLoading, setIsLoading] = useState(false)
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [availableUsers, setAvailableUsers] = useState<User[]>([])
  const [loadingOrgs, setLoadingOrgs] = useState(true)
  const [loadingUsers, setLoadingUsers] = useState(false)

  const isEditing = !!team

  const form = useForm<TeamFormValues>({
    resolver: zodResolver(teamFormSchema),
    defaultValues: {
      name: team?.name || "",
      description: team?.description || "",
      organizationId: team?.organizationId || "",
      memberIds: selectedMembers.map(m => m.id) || [],
    },
  })

  // Fetch organizations on mount
  useEffect(() => {
    fetchOrganizations()
  }, [])



  const fetchOrganizations = async () => {
    try {
      const response = await fetch('/api/organizations')
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch organizations')
      }

      setOrganizations(result.organizations)
    } catch (error) {
      console.error("Error fetching organizations:", error)
      toast.error("Failed to load organizations")    } finally {
      setLoadingOrgs(false)
    }
  }
  
  const fetchOrganizationUsers = useCallback(async (organizationId: string) => {
    setLoadingUsers(true)
    try {
      const response = await fetch(`/api/organizations/${organizationId}/members`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch organization members')
      }

      const members = await response.json()
      setAvailableUsers(members || [])
    } catch (error) {
      console.error("Error fetching organization users:", error)
      toast.error("Failed to load organization members")
      setAvailableUsers([])
    } finally {
      setLoadingUsers(false)
    }
  }, [])

    // Fetch users when organization changes
  useEffect(() => {
    const orgId = form.watch("organizationId")
    if (orgId) {
      fetchOrganizationUsers(orgId)
    }
  }, [form, fetchOrganizationUsers])

  const onSubmit = async (values: TeamFormValues) => {
    setIsLoading(true)
    try {
      const teamData = {
        ...values,
        memberIds: selectedMembers.map(m => m.id),
      }

      const response = await fetch(isEditing ? `/api/teams/${team.id}` : '/api/teams', {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(teamData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save team')
      }

      onSave(result.team)
      onOpenChange(false)
      form.reset()
      setSelectedMembers([])
      toast.success(isEditing ? "Team updated successfully!" : "Team created successfully!")
    } catch (error) {
      console.error("Error saving team:", error)
      toast.error(error instanceof Error ? error.message : "Failed to save team")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddMember = (user: User) => {
    if (!selectedMembers.find(m => m.id === user.id)) {
      setSelectedMembers([...selectedMembers, user])
    }
  }

  const handleRemoveMember = (userId: string) => {
    setSelectedMembers(selectedMembers.filter(m => m.id !== userId))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Team" : "Create New Team"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Update the team details below." : "Fill in the details to create a new team."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Team Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Team Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter team name..." {...field} />
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
                      placeholder="Enter team description..." 
                      className="min-h-[80px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Optional description of the team&apos;s purpose and goals
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Organization */}
            <FormField
              control={form.control}
              name="organizationId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organization</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={loadingOrgs}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={loadingOrgs ? "Loading organizations..." : "Select organization"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {organizations.map((org) => (
                        <SelectItem key={org.id} value={org.id}>
                          <div className="flex items-center">
                            <Building className="mr-2 h-4 w-4 text-muted-foreground" />
                            <div>
                              <div className="font-medium">{org.name}</div>
                              {org.description && (
                                <div className="text-xs text-muted-foreground">{org.description}</div>
                              )}
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Select the organization this team belongs to
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Team Members */}
            <div className="space-y-4">
              <FormLabel>Team Members</FormLabel>
              
              {/* Selected Members */}
              {selectedMembers.length > 0 && (
                <div className="space-y-2">
                  <div className="text-sm font-medium">Selected Members ({selectedMembers.length})</div>
                  <div className="grid gap-2">
                    {selectedMembers.map((member) => (
                      <div key={member.id} className="flex items-center justify-between p-2 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={member.image || undefined} />
                            <AvatarFallback className="text-xs">
                              {member.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-sm">{member.name}</div>
                            <div className="text-xs text-muted-foreground">{member.email}</div>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveMember(member.id)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add Members */}
              {form.watch("organizationId") && (
                <div className="space-y-2">
                  <div className="text-sm font-medium">
                    Add Members
                    {loadingUsers && <span className="text-muted-foreground"> (Loading...)</span>}
                  </div>
                  
                  {!loadingUsers && availableUsers.length > 0 ? (
                    <div className="grid gap-2 max-h-48 overflow-y-auto">
                      {availableUsers
                        .filter(user => !selectedMembers.find(m => m.id === user.id))
                        .map((user) => (
                          <div key={user.id} className="flex items-center justify-between p-2 border rounded-lg hover:bg-gray-50">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={user.image || undefined} />
                                <AvatarFallback className="text-xs">
                                  {user.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium text-sm">{user.name}</div>
                                <div className="text-xs text-muted-foreground">{user.email}</div>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleAddMember(user)}
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Add
                            </Button>
                          </div>
                        ))}
                    </div>
                  ) : !loadingUsers && availableUsers.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">
                      <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <div className="text-sm">No available users found</div>
                    </div>
                  ) : null}
                </div>
              )}

              {!form.watch("organizationId") && (
                <div className="text-center py-4 text-muted-foreground">
                  <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <div className="text-sm">Select an organization first to add members</div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : (isEditing ? "Update Team" : "Create Team")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

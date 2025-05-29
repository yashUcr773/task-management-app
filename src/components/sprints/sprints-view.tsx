"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CreateSprintDialog } from "./create-sprint-dialog"
import { 
  Plus, 
  Calendar,
  CheckSquare,
  MoreHorizontal,
  Edit,
  Trash,
  Play,
  Pause,
  Users
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"

interface Sprint {
  id: string
  name: string
  teamId: string
  startDate: string
  endDate: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  team: {
    id: string
    name: string
    organization: {
      id: string
      name: string
    }
  }
  _count: {
    tasks: number
  }
}

export function SprintsView() {
  const [sprints, setSprints] = useState<Sprint[]>([])
  const [loading, setLoading] = useState(true)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editingSprint, setEditingSprint] = useState<Sprint | null>(null)

  useEffect(() => {
    fetchSprints()
  }, [])

  const fetchSprints = async () => {
    try {
      const response = await fetch('/api/sprints')
      
      if (!response.ok) {
        throw new Error('Failed to fetch sprints')
      }

      const result = await response.json()
      setSprints(result.sprints || [])
    } catch (error) {
      console.error("Error fetching sprints:", error)
      toast.error("Failed to load sprints")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateSprint = async (sprintData: any) => {
    try {
      const response = await fetch('/api/sprints', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sprintData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create sprint')
      }

      const newSprint = await response.json()
      setSprints(prev => [newSprint, ...prev])
      setCreateDialogOpen(false)
      toast.success("Sprint created successfully")
    } catch (error) {
      console.error("Error creating sprint:", error)
      toast.error(error instanceof Error ? error.message : "Failed to create sprint")
    }
  }

  const handleEditSprint = async (id: string, sprintData: any) => {
    try {
      const response = await fetch(`/api/sprints/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sprintData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update sprint')
      }

      const updatedSprint = await response.json()
      setSprints(prev => prev.map(sprint => sprint.id === id ? updatedSprint : sprint))
      setEditingSprint(null)
      toast.success("Sprint updated successfully")
    } catch (error) {
      console.error("Error updating sprint:", error)
      toast.error(error instanceof Error ? error.message : "Failed to update sprint")
    }
  }

  const handleToggleActive = async (sprint: Sprint) => {
    try {
      const response = await fetch(`/api/sprints/${sprint.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isActive: !sprint.isActive
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update sprint status')
      }

      const updatedSprint = await response.json()
      setSprints(prev => prev.map(s => 
        s.id === sprint.id ? updatedSprint : 
        s.teamId === sprint.teamId && updatedSprint.isActive ? { ...s, isActive: false } : s
      ))
      toast.success(`Sprint ${updatedSprint.isActive ? 'activated' : 'deactivated'} successfully`)
    } catch (error) {
      console.error("Error toggling sprint status:", error)
      toast.error(error instanceof Error ? error.message : "Failed to update sprint status")
    }
  }

  const handleDeleteSprint = async (id: string) => {
    if (!confirm("Are you sure you want to delete this sprint? This action cannot be undone.")) {
      return
    }

    try {
      const response = await fetch(`/api/sprints/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete sprint')
      }

      setSprints(prev => prev.filter(sprint => sprint.id !== id))
      toast.success("Sprint deleted successfully")
    } catch (error) {
      console.error("Error deleting sprint:", error)
      toast.error(error instanceof Error ? error.message : "Failed to delete sprint")
    }
  }

  const isSprintActive = (sprint: Sprint): boolean => {
    const now = new Date()
    const startDate = new Date(sprint.startDate)
    const endDate = new Date(sprint.endDate)
    return now >= startDate && now <= endDate
  }

  const getSprintStatus = (sprint: Sprint): { label: string; variant: any } => {
    const now = new Date()
    const startDate = new Date(sprint.startDate)
    const endDate = new Date(sprint.endDate)

    if (sprint.isActive) {
      return { label: "Active", variant: "default" }
    } else if (now < startDate) {
      return { label: "Upcoming", variant: "secondary" }
    } else if (now > endDate) {
      return { label: "Completed", variant: "outline" }
    } else {
      return { label: "Inactive", variant: "secondary" }
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="h-8 w-32 bg-gray-200 rounded animate-pulse" />
          <div className="h-10 w-24 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Sprints</h2>
          <p className="text-muted-foreground">
            Manage your sprints and track team progress
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Sprint
        </Button>
      </div>

      {sprints.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No sprints found</h3>
            <p className="text-muted-foreground text-center mb-4">
              Get started by creating your first sprint to organize your team's work
            </p>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Sprint
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sprints.map((sprint) => {
            const status = getSprintStatus(sprint)
            return (
              <Card key={sprint.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <CardTitle className="text-lg leading-tight">
                        {sprint.name}
                      </CardTitle>
                      <div className="flex items-center space-x-2">
                        <Badge variant={status.variant} className="text-xs">
                          {status.label}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          <Users className="h-3 w-3 mr-1" />
                          {sprint.team.name}
                        </Badge>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleToggleActive(sprint)}>
                          {sprint.isActive ? (
                            <>
                              <Pause className="h-4 w-4 mr-2" />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <Play className="h-4 w-4 mr-2" />
                              Activate
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setEditingSprint(sprint)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeleteSprint(sprint.id)}
                          className="text-destructive"
                        >
                          <Trash className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    <div className="flex items-center justify-between mb-1">
                      <span>Organization:</span>
                      <span>{sprint.team.organization.name}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(sprint.startDate).toLocaleDateString()}</span>
                      <span>-</span>
                      <span>{new Date(sprint.endDate).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center space-x-2">
                      <CheckSquare className="h-4 w-4" />
                      <span>{sprint._count.tasks} tasks</span>
                    </div>
                    <div className="text-xs">
                      {Math.ceil((new Date(sprint.endDate).getTime() - new Date(sprint.startDate).getTime()) / (1000 * 60 * 60 * 24))} days
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <CreateSprintDialog
        open={createDialogOpen || !!editingSprint}
        onOpenChange={(open: boolean) => {
          if (!open) {
            setCreateDialogOpen(false)
            setEditingSprint(null)
          }
        }}
        sprint={editingSprint}
        onSave={editingSprint ? 
          (data: any) => handleEditSprint(editingSprint.id, data) : 
          handleCreateSprint
        }
      />
    </div>
  )
}

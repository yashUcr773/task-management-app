"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CreateEpicDialog } from "./create-epic-dialog"
import { 
  Plus, 
  BookOpen,
  Calendar,
  CheckSquare,
  MoreHorizontal,
  Edit,
  Trash
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"

interface Epic {
  id: string
  title: string
  description?: string
  organizationId: string
  createdAt: string
  updatedAt: string
  organization: {
    id: string
    name: string
  }
  _count: {
    tasks: number
  }
}

export function EpicsView() {
  const [epics, setEpics] = useState<Epic[]>([])
  const [loading, setLoading] = useState(true)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editingEpic, setEditingEpic] = useState<Epic | null>(null)

  useEffect(() => {
    fetchEpics()
  }, [])

  const fetchEpics = async () => {
    try {
      const response = await fetch('/api/epics')
      
      if (!response.ok) {
        throw new Error('Failed to fetch epics')
      }

      const result = await response.json()
      setEpics(result.epics || [])
    } catch (error) {
      console.error("Error fetching epics:", error)
      toast.error("Failed to load epics")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateEpic = async (epicData: Record<string, unknown>) => {
    try {
      const response = await fetch('/api/epics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(epicData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create epic')
      }

      const newEpic = await response.json()
      setEpics(prev => [newEpic, ...prev])
      setCreateDialogOpen(false)
      toast.success("Epic created successfully")
    } catch (error) {
      console.error("Error creating epic:", error)
      toast.error(error instanceof Error ? error.message : "Failed to create epic")
    }
  }

  const handleEditEpic = async (id: string, epicData: Record<string, unknown>) => {
    try {
      const response = await fetch(`/api/epics/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(epicData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update epic')
      }

      const updatedEpic = await response.json()
      setEpics(prev => prev.map(epic => epic.id === id ? updatedEpic : epic))
      setEditingEpic(null)
      toast.success("Epic updated successfully")
    } catch (error) {
      console.error("Error updating epic:", error)
      toast.error(error instanceof Error ? error.message : "Failed to update epic")
    }
  }

  const handleDeleteEpic = async (id: string) => {
    if (!confirm("Are you sure you want to delete this epic? This action cannot be undone.")) {
      return
    }

    try {
      const response = await fetch(`/api/epics/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete epic')
      }

      setEpics(prev => prev.filter(epic => epic.id !== id))
      toast.success("Epic deleted successfully")
    } catch (error) {
      console.error("Error deleting epic:", error)
      toast.error(error instanceof Error ? error.message : "Failed to delete epic")
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
          <h2 className="text-2xl font-bold tracking-tight">Epics</h2>
          <p className="text-muted-foreground">
            Manage your epics and track progress across teams
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Epic
        </Button>
      </div>

      {epics.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No epics found</h3>
            <p className="text-muted-foreground text-center mb-4">
              Get started by creating your first epic to organize your work
            </p>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Epic
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {epics.map((epic) => (
            <Card key={epic.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <CardTitle className="text-lg leading-tight">
                      {epic.title}
                    </CardTitle>
                    <Badge variant="secondary" className="text-xs">
                      {epic.organization.name}
                    </Badge>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setEditingEpic(epic)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDeleteEpic(epic.id)}
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
                {epic.description && (
                  <CardDescription className="line-clamp-3">
                    {epic.description}
                  </CardDescription>
                )}
                
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center space-x-2">
                    <CheckSquare className="h-4 w-4" />
                    <span>{epic._count.tasks} tasks</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(epic.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CreateEpicDialog
        open={createDialogOpen || !!editingEpic}
        onOpenChange={(open: boolean) => {
          if (!open) {
            setCreateDialogOpen(false)
            setEditingEpic(null)
          }
        }}
        epic={editingEpic}        onSave={editingEpic ? 
          (data: Record<string, unknown>) => handleEditEpic(editingEpic.id, data) : 
          handleCreateEpic
        }
      />
    </div>
  )
}

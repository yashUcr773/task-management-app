"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { 
  Target, 
  Search,
  Loader2,
  ArrowRight,
  Calendar,
  CheckSquare,
} from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface Epic {
  id: string
  title: string
  description?: string
  createdAt: string
  updatedAt: string
  _count: {
    tasks: number
  }
}

interface Organization {
  id: string
  name: string
  description?: string | null
}

interface OrganizationEpicsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organization: {
    id: string;
    name: string;
    description?: string | null;
  } | null;
}

export function OrganizationEpicsModal({
  open,
  onOpenChange,
  organization,
}: OrganizationEpicsModalProps) {
  const router = useRouter()
  const [epics, setEpics] = useState<Epic[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const fetchOrganizationEpics = useCallback(async () => {
    if (!organization) return
    
    try {
      setLoading(true)
      const response = await fetch(`/api/epics?organizationId=${organization.id}&limit=50`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch organization epics')
      }

      const data = await response.json()
      setEpics(data.epics || [])
    } catch (error) {
      console.error("Error fetching organization epics:", error)
      toast.error("Failed to load organization epics")
    } finally {
      setLoading(false)
    }
  }, [organization])

  useEffect(() => {
    if (organization && open) {
      fetchOrganizationEpics()
    }
  }, [organization, open, fetchOrganizationEpics])
  const filteredEpics = epics.filter(epic =>
    epic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    epic.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )
  // Epic statistics based on actual Epic model fields
  const epicStats = {
    total: epics.length,
    withTasks: epics.filter(epic => epic._count.tasks > 0).length,
    withoutTasks: epics.filter(epic => epic._count.tasks === 0).length,
    totalTasks: epics.reduce((sum, epic) => sum + epic._count.tasks, 0),
  }

  const handleViewAllEpics = () => {
    router.push(`/epics?organizationId=${organization?.id}`)
    onOpenChange(false)
  }

  const handleEpicClick = (epicId: string) => {
    router.push(`/epics?id=${epicId}`)
    onOpenChange(false)
  }
  if (!organization) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            {organization.name} - Epics
          </DialogTitle>
          <DialogDescription>
            {organization.description || "View and manage epics in this organization"}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 space-y-4 overflow-hidden">          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-4">
            <div className="p-3 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{epicStats.total}</div>
              <div className="text-xs text-muted-foreground">Total Epics</div>
            </div>
            <div className="p-3 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">{epicStats.withTasks}</div>
              <div className="text-xs text-muted-foreground">With Tasks</div>
            </div>
            <div className="p-3 border rounded-lg">
              <div className="text-2xl font-bold text-gray-600">{epicStats.withoutTasks}</div>
              <div className="text-xs text-muted-foreground">Without Tasks</div>
            </div>
            <div className="p-3 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{epicStats.totalTasks}</div>
              <div className="text-xs text-muted-foreground">Total Tasks</div>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />            <Input
              placeholder="Search epics by title or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Epics List */}
          <div className="flex-1 overflow-y-auto space-y-3 max-h-[400px] pr-2">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : filteredEpics.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                {searchQuery ? (
                  <p>No epics match your search.</p>
                ) : (
                  <p>No epics found for this organization.</p>
                )}
              </div>
            ) : (
              filteredEpics.map((epic) => (
                <div
                  key={epic.id}
                  className="border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => handleEpicClick(epic.id)}
                >
                  <div className="space-y-3">                    {/* Epic Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold truncate">
                          {epic.title}
                        </h4>
                        {epic.description && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {epic.description}
                          </p>
                        )}
                      </div>
                    </div>                    {/* Epic Details */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        {/* Task Count */}
                        <div className="flex items-center gap-1">
                          <CheckSquare className="h-4 w-4" />
                          <span>{epic._count.tasks} tasks</span>
                        </div>
                      </div>

                      <div className="text-xs text-muted-foreground">
                        Created {format(new Date(epic.createdAt), "MMM d, yyyy")}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Summary */}
          {!loading && filteredEpics.length > 0 && (
            <div className="border-t pt-4">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>
                  Showing {filteredEpics.length} of {epics.length} epics
                </span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleViewAllEpics}
                  className="flex items-center gap-2"
                >
                  View All Epics
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

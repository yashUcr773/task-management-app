"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { 
  Users, 
  Search,
  Loader2,
  Building2,
  CheckSquare,
} from "lucide-react"
import { toast } from "sonner"
import { TeamMembersModal } from "./team-members-modal"
import { TeamTasksModal } from "./team-tasks-modal"

interface User {
  id: string
  name: string
  email: string
  image?: string | null
}

interface TeamMember {
  id: string
  role: string
  user: User
}

interface Team {
  id: string
  name: string
  description?: string
  organization: {
    id: string
    name: string
  }
  members: TeamMember[]
  _count: {
    tasks: number
  }
  createdAt: string
  updatedAt: string
}

interface Organization {
  id: string
  name: string
  description: string | null
}

interface OrganizationTeamsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  organization: Organization
}

export function OrganizationTeamsDialog({
  open,
  onOpenChange,
  organization,
}: OrganizationTeamsDialogProps) {
  const router = useRouter()
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  
  // Modal states
  const [membersModalOpen, setMembersModalOpen] = useState(false)
  const [tasksModalOpen, setTasksModalOpen] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)

  const fetchTeams = useCallback( async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/teams?organizationId=${organization.id}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch teams')
      }

      const data = await response.json()
      setTeams(data.teams || [])
    } catch (error) {
      console.error("Error fetching teams:", error)
      toast.error("Failed to load teams")
    } finally {
      setLoading(false)
    }
  }, [organization.id])

  useEffect(() => {
    if (organization && open) {
      fetchTeams()
    }
  }, [organization, open, fetchTeams])

  const filteredTeams = teams.filter(team =>
    team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    team.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )
  const getRoleColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-red-100 text-red-800"
      case "USER":
        return "bg-blue-100 text-blue-800"
      case "VIEWER":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }
  const handleViewTasks = (teamId: string) => {
    // Navigate to tasks page filtered by team
    router.push(`/tasks?teamId=${teamId}`)
    // Close the dialog
    onOpenChange(false)
  }

  const handleOpenMembersModal = (team: Team) => {
    setSelectedTeam(team)
    setMembersModalOpen(true)
  }

  const handleOpenTasksModal = (team: Team) => {
    setSelectedTeam(team)
    setTasksModalOpen(true)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Teams in {organization.name}
          </DialogTitle>
          <DialogDescription>
            View and manage teams within this organization
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 space-y-4 overflow-hidden">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search teams..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Teams List */}
          <div className="flex-1 overflow-y-auto space-y-4 max-h-[500px]">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : filteredTeams.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                {searchQuery ? (
                  <p>No teams match your search.</p>
                ) : (
                  <>
                    <p className="mb-2">No teams found in this organization.</p>
                    <p className="text-sm">Teams can be created from the Teams page.</p>
                  </>
                )}
              </div>
            ) : (
              filteredTeams.map((team) => (
                <div
                  key={team.id}
                  className="border rounded-lg p-4 space-y-3"
                >                  {/* Team Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold truncate">{team.name}</h3>
                      {team.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {team.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground ml-4">
                      <button
                        onClick={() => handleOpenMembersModal(team)}
                        className="flex items-center gap-1 hover:text-foreground hover:bg-muted rounded px-2 py-1 transition-colors cursor-pointer"
                        title="Click to view team members"
                      >
                        <Users className="h-4 w-4" />
                        <span className="font-medium text-blue-600 hover:text-blue-800">
                          {team.members.length}
                        </span>
                        <span>members</span>
                      </button>
                      <button
                        onClick={() => handleOpenTasksModal(team)}
                        className="flex items-center gap-1 hover:text-foreground hover:bg-muted rounded px-2 py-1 transition-colors cursor-pointer"
                        title="Click to view team tasks"
                      >
                        <CheckSquare className="h-4 w-4" />
                        <span className="font-medium text-blue-600 hover:text-blue-800">
                          {team._count.tasks}
                        </span>
                        <span>tasks</span>
                      </button>
                    </div>
                  </div>

                  {/* Team Members */}
                  {team.members.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Members</span>
                        <Badge variant="outline" className="text-xs">
                          {team.members.length}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {team.members.slice(0, 5).map((member) => (
                          <div key={member.id} className="flex items-center justify-between">
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={member.user.image || undefined} />
                                <AvatarFallback className="text-xs">
                                  {member.user.name?.slice(0, 2).toUpperCase() || "U"}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium truncate">
                                  {member.user.name || "Unnamed User"}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">
                                  {member.user.email}
                                </p>
                              </div>
                            </div>
                            <Badge 
                              variant="secondary" 
                              className={`text-xs ${getRoleColor(member.role)} ml-2`}
                            >
                              {member.role}
                            </Badge>
                          </div>
                        ))}
                        
                        {team.members.length > 5 && (
                          <div className="text-xs text-muted-foreground text-center">
                            +{team.members.length - 5} more members
                          </div>
                        )}
                      </div>
                    </div>
                  )}                  {/* Team Actions */}
                  <div className="flex gap-2 pt-2 border-t">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleViewTasks(team.id)}
                    >
                      <CheckSquare className="h-4 w-4 mr-2" />
                      View Tasks
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Summary */}
          {!loading && filteredTeams.length > 0 && (
            <div className="border-t pt-4">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Total Teams: {filteredTeams.length}</span>
                <span>
                  Total Members: {filteredTeams.reduce((acc, team) => acc + team.members.length, 0)}
                </span>
              </div>
            </div>
          )}        </div>
      </DialogContent>      {/* Team Members Modal */}
      <TeamMembersModal
        open={membersModalOpen}
        onOpenChange={setMembersModalOpen}
        team={selectedTeam}
        members={selectedTeam?.members}
      />

      {/* Team Tasks Modal */}
      <TeamTasksModal
        open={tasksModalOpen}
        onOpenChange={setTasksModalOpen}
        team={selectedTeam}
      />
    </Dialog>
  )
}

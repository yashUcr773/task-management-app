"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CreateTeamDialog } from "@/components/teams/create-team-dialog"
import { 
  Plus, 
  Users, 
  Settings,
  MoreHorizontal,
  Calendar,
  CheckSquare,
  ChevronLeft
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"

interface Team {
  id: string
  name: string
  description?: string
  organization: {
    id: string
    name: string
  }
  members: Array<{
    id: string
    role: string
    user: {
      id: string
      name: string
      email: string
      image?: string | null
    }
  }>
  _count: {
    tasks: number
  }
  createdAt: string
  updatedAt: string
}

export function TeamsView() {
  const router = useRouter()
  const [createTeamOpen, setCreateTeamOpen] = useState(false)
  const [teams, setTeams] = useState<Team[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchTeams()
  }, [])

  const fetchTeams = async () => {
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
      setIsLoading(false)
    }  }
    const handleTeamSave = (team: Team) => {
    // Update the teams list with the new/updated team
    setTeams(prevTeams => {
      const existingIndex = prevTeams.findIndex(t => t.id === team.id)
      if (existingIndex >= 0) {
        // Update existing team
        const updatedTeams = [...prevTeams]
        updatedTeams[existingIndex] = team
        return updatedTeams
      } else {
        // Add new team
        return [...prevTeams, team]
      }
    })
  }

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
  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Teams</h1>
            <p className="text-muted-foreground">
              Manage and collaborate with your teams
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setCreateTeamOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Team
          </Button>
        </div>
      </div>

      {/* Teams Grid */}
      {teams.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No teams yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create your first team to start collaborating
            </p>
            <Button onClick={() => setCreateTeamOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Team
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {teams.map((team) => (
            <Card key={team.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{team.name}</CardTitle>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Settings className="mr-2 h-4 w-4" />
                        Edit Team
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Users className="mr-2 h-4 w-4" />
                        Manage Members
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <CardDescription>
                  {team.description || "No description"}
                </CardDescription>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{team.organization.name}</span>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {/* Team Stats */}
                <div className="flex items-center gap-4 mb-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{team.members.length} members</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckSquare className="h-4 w-4 text-muted-foreground" />
                    <span>{team._count.tasks} tasks</span>
                  </div>
                </div>

                {/* Team Members */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Members</span>
                    <Badge variant="secondary" className="text-xs">
                      {team.members.length}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    {team.members.slice(0, 3).map((member) => (
                      <div key={member.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={member.user.image || undefined} />
                            <AvatarFallback className="text-xs">
                              {member.user.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{member.user.name}</p>
                            <p className="text-xs text-muted-foreground">{member.user.email}</p>
                          </div>
                        </div>
                        <Badge variant="secondary" className={`text-xs ${getRoleColor(member.role)}`}>
                          {member.role}
                        </Badge>
                      </div>
                    ))}
                    
                    {team.members.length > 3 && (
                      <div className="text-xs text-muted-foreground">
                        +{team.members.length - 3} more members
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm" className="flex-1">
                    View Tasks
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Calendar className="mr-2 h-4 w-4" />
                    Schedule
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CreateTeamDialog 
        open={createTeamOpen} 
        onOpenChange={setCreateTeamOpen}
        onSave={handleTeamSave}
      />
    </div>
  )
}

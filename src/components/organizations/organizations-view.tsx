"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Plus, 
  Building2, 
  Users, 
  Search, 
  Settings, 
  UserPlus,
  Crown,
  MoreVertical,
  Copy,
  LogOut,
  Edit,
  Trash2,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CreateOrganizationDialog } from "./create-organization-dialog"
import { JoinOrganizationDialog } from "./join-organization-dialog"
import { ManageOrganizationDialog } from "./manage-organization-dialog"
import { OrganizationTeamsDialog } from "./organization-teams-dialog"
import { EditOrganizationDialog } from "./edit-organization-dialog"
import { OrganizationMembersModal } from "./organization-members-modal"
import { OrganizationEpicsModal } from "./organization-epics-modal"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"
import { toast } from "sonner"

interface User {
  id: string
  name: string | null
  email: string
  image: string | null
}

interface Organization {
  id: string
  name: string
  description: string | null
  createdAt: string
  updatedAt: string
  users: {
    id: string
    userId: string
    organizationId: string
    role: string
    joinedAt: string
    user: User
  }[]
  teams: {
    id: string
    name: string
    _count: {
      members: number
    }
  }[]
  _count: {
    epics: number
  }
}

export function OrganizationsView() {
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("my-organizations")  // Dialog states
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showJoinDialog, setShowJoinDialog] = useState(false)
  const [showManageDialog, setShowManageDialog] = useState(false)
  const [showTeamsDialog, setShowTeamsDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showLeaveDialog, setShowLeaveDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showMembersModal, setShowMembersModal] = useState(false)
  const [showEpicsModal, setShowEpicsModal] = useState(false)
  const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(null)

  const fetchOrganizations = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/organizations')
      
      if (!response.ok) {
        throw new Error('Failed to fetch organizations')
      }

      const data = await response.json()
      setOrganizations(data.organizations || [])
    } catch (error) {
      console.error("Error fetching organizations:", error)
      toast.error("Failed to load organizations")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrganizations()
  }, [])

  const filteredOrganizations = organizations.filter(org =>
    org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    org.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getUserRole = (org: Organization): string => {
    // Assuming we need to get current user's role from session
    // For now, we'll check if user is admin based on the first user's role
    return org.users[0]?.role || "USER"
  }

  const copyInviteLink = (orgId: string) => {
    const inviteLink = `${window.location.origin}/organizations/join?code=${orgId}`
    navigator.clipboard.writeText(inviteLink)
    toast.success("Invite link copied to clipboard!")
  }
  const handleLeaveOrganization = (org: Organization) => {
    setSelectedOrganization(org)
    setShowLeaveDialog(true)
  }

  const confirmLeaveOrganization = async () => {
    if (!selectedOrganization) return

    try {
      const response = await fetch(`/api/organizations/${selectedOrganization.id}/leave`, {
        method: 'POST'
      })

      if (!response.ok) {
        throw new Error('Failed to leave organization')
      }

      toast.success("Left organization successfully")
      fetchOrganizations() // Refresh the list
    } catch (error) {
      console.error("Error leaving organization:", error)
      toast.error("Failed to leave organization")
    }
  }

  const handleEditOrganization = (org: Organization) => {
    setSelectedOrganization(org)
    setShowEditDialog(true)
  }
  const handleManageOrganization = (org: Organization) => {
    setSelectedOrganization(org)
    setShowManageDialog(true)
  }
    const handleViewTeams = (org: Organization) => {
    setSelectedOrganization(org)
    setShowTeamsDialog(true)
  }

  const handleViewMembers = (org: Organization) => {
    setSelectedOrganization(org)
    setShowMembersModal(true)
  }

  const handleViewEpics = (org: Organization) => {
    setSelectedOrganization(org)
    setShowEpicsModal(true)
  }
  
  const handleDeleteOrganization = (org: Organization) => {
    setSelectedOrganization(org)
    setShowDeleteDialog(true)
  }

  const confirmDeleteOrganization = async () => {
    if (!selectedOrganization) return

    try {
      const response = await fetch(`/api/organizations/${selectedOrganization.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete organization')
      }

      toast.success("Organization deleted successfully")
      fetchOrganizations() // Refresh the list
    } catch (error) {
      console.error("Error deleting organization:", error)
      toast.error(error instanceof Error ? error.message : "Failed to delete organization")
    }
  }

  const refreshOrganizations = () => {
    fetchOrganizations()
  }

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Organizations</h1>
            <p className="text-muted-foreground">
              Manage your organizations and collaborate with teams
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowJoinDialog(true)} variant="outline">
            <UserPlus className="h-4 w-4 mr-2" />
            Join Organization
          </Button>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Organization
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search organizations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="my-organizations">My Organizations</TabsTrigger>
        </TabsList>

        <TabsContent value="my-organizations" className="space-y-4">
          {filteredOrganizations.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No organizations found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery ? "No organizations match your search." : "Get started by creating or joining an organization."}
              </p>
              <div className="flex gap-2 justify-center">
                <Button onClick={() => setShowJoinDialog(true)} variant="outline">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Join Organization
                </Button>
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Organization
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredOrganizations.map((org) => {
                const userRole = getUserRole(org)
                const isAdmin = userRole === "ADMIN"
                
                return (
                  <Card key={org.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">                          <div className="flex items-center gap-2 mb-2">
                            <Building2 className="h-5 w-5 text-primary" />
                            <CardTitle className="leading-tight">{org.name}</CardTitle>                            {isAdmin && (
                              <div title="Admin">
                                <Crown className="h-4 w-4 text-yellow-500" />
                              </div>
                            )}
                          </div>
                          <Badge variant={isAdmin ? "default" : "secondary"}>
                            {userRole}
                          </Badge>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => copyInviteLink(org.id)}>
                              <Copy className="h-4 w-4 mr-2" />
                              Copy Invite Link
                            </DropdownMenuItem>
                            {isAdmin && (
                              <>
                                <DropdownMenuItem onClick={() => handleEditOrganization(org)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleManageOrganization(org)}>
                                  <Settings className="h-4 w-4 mr-2" />
                                  Manage Members
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleDeleteOrganization(org)}
                                  className="text-destructive"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete Organization
                                </DropdownMenuItem>
                              </>
                            )}                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleLeaveOrganization(org)}
                              className="text-destructive"
                            >
                              <LogOut className="h-4 w-4 mr-2" />
                              Leave Organization
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      {org.description && (
                        <CardDescription className="line-clamp-2">
                          {org.description}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-4">                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <button
                          onClick={() => handleViewMembers(org)}
                          className="hover:bg-muted rounded-lg p-2 transition-colors cursor-pointer"
                          title="Click to view organization members"
                        >
                          <div className="text-2xl font-bold text-blue-600 hover:text-blue-800">
                            {org.users.length}
                          </div>
                          <div className="text-xs text-muted-foreground">Members</div>
                        </button>
                        <button
                          onClick={() => handleViewTeams(org)}
                          className="hover:bg-muted rounded-lg p-2 transition-colors cursor-pointer"
                          title="Click to view organization teams"
                        >
                          <div className="text-2xl font-bold text-blue-600 hover:text-blue-800">
                            {org.teams.length}
                          </div>
                          <div className="text-xs text-muted-foreground">Teams</div>
                        </button>
                        <button
                          onClick={() => handleViewEpics(org)}
                          className="hover:bg-muted rounded-lg p-2 transition-colors cursor-pointer"
                          title="Click to view organization epics"
                        >
                          <div className="text-2xl font-bold text-blue-600 hover:text-blue-800">
                            {org._count.epics}
                          </div>
                          <div className="text-xs text-muted-foreground">Epics</div>
                        </button>
                      </div>

                      {/* Recent Members */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Members</span>
                          <Badge variant="outline">
                            {org.users.length}
                          </Badge>
                        </div>
                        <div className="flex -space-x-2">
                          {org.users.slice(0, 5).map((member) => (
                            <Avatar key={member.user.id} className="w-8 h-8 border-2 border-background">
                              <AvatarImage src={member.user.image || ""} />
                              <AvatarFallback className="text-xs">
                                {member.user.name?.slice(0, 2).toUpperCase() || "U"}
                              </AvatarFallback>
                            </Avatar>
                          ))}
                          {org.users.length > 5 && (
                            <div className="w-8 h-8 bg-muted border-2 border-background rounded-full flex items-center justify-center">
                              <span className="text-xs font-medium">
                                +{org.users.length - 5}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>                      {/* Quick Actions */}
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => handleViewTeams(org)}
                        >
                          <Users className="h-4 w-4 mr-2" />
                          View Teams
                        </Button>
                        {isAdmin && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleManageOrganization(org)}
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <CreateOrganizationDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={refreshOrganizations}
      />

      <JoinOrganizationDialog
        open={showJoinDialog}
        onOpenChange={setShowJoinDialog}
        onSuccess={refreshOrganizations}
      />      {selectedOrganization && (
        <>
          <ManageOrganizationDialog
            open={showManageDialog}
            onOpenChange={setShowManageDialog}
            organization={selectedOrganization}
            onSuccess={refreshOrganizations}
          />          <OrganizationTeamsDialog
            open={showTeamsDialog}
            onOpenChange={setShowTeamsDialog}
            organization={selectedOrganization}
          />

          <OrganizationMembersModal
            open={showMembersModal}
            onOpenChange={setShowMembersModal}
            organization={selectedOrganization}
            members={selectedOrganization?.users}
          />

          <OrganizationEpicsModal
            open={showEpicsModal}
            onOpenChange={setShowEpicsModal}
            organization={selectedOrganization}
          />

          <EditOrganizationDialog
            open={showEditDialog}
            onOpenChange={setShowEditDialog}
            organization={selectedOrganization}
            onSuccess={refreshOrganizations}
          />
        </>
      )}{/* Confirmation Dialogs */}
      <ConfirmationDialog
        open={showLeaveDialog}
        onOpenChange={setShowLeaveDialog}
        title="Leave Organization"
        description={
          selectedOrganization
            ? `Are you sure you want to leave "${selectedOrganization.name}"? 

You will lose access to:
• ${selectedOrganization.teams.length} team${selectedOrganization.teams.length !== 1 ? 's' : ''}
• ${selectedOrganization._count.epics} epic${selectedOrganization._count.epics !== 1 ? 's' : ''}
• All projects and data within this organization

This action cannot be undone and you'll need a new invitation to rejoin.`
            : ""
        }
        confirmText="Leave Organization"
        variant="destructive"
        onConfirm={confirmLeaveOrganization}
      />

      <ConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Organization"
        description={
          selectedOrganization
            ? `Are you sure you want to permanently delete "${selectedOrganization.name}"?

This will permanently remove:
• ${selectedOrganization.users.length} member${selectedOrganization.users.length !== 1 ? 's' : ''}
• ${selectedOrganization.teams.length} team${selectedOrganization.teams.length !== 1 ? 's' : ''}
• ${selectedOrganization._count.epics} epic${selectedOrganization._count.epics !== 1 ? 's' : ''}
• All associated projects and data

This action cannot be undone and all data will be permanently lost.`
            : ""
        }
        confirmText="Delete Organization"
        variant="destructive"
        onConfirm={confirmDeleteOrganization}
      />
    </div>
  )
}

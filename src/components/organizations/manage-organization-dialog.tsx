"use client"

import { useState, useEffect, useCallback } from "react"
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
  Settings, 
  UserMinus, 
  Crown, 
  User, 
  Search,
  Loader2,
  Mail,
  ShieldCheck
} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"

interface User {
  id: string
  name: string | null
  email: string
  image: string | null
}

interface OrganizationMember {
  id: string
  userId: string
  organizationId: string
  role: string
  joinedAt: string
  user: User
}

interface Organization {
  id: string
  name: string
  description: string | null
  users: OrganizationMember[]
}

interface ManageOrganizationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  organization: Organization
  onSuccess: () => void
}

export function ManageOrganizationDialog({
  open,
  onOpenChange,
  organization,
  onSuccess,
}: ManageOrganizationDialogProps) {
  const [members, setMembers] = useState<OrganizationMember[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [removingMember, setRemovingMember] = useState<string | null>(null)
  const [memberToRemove, setMemberToRemove] = useState<OrganizationMember | null>(null)

    const fetchMembers = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/organizations/${organization.id}/members`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch members')
      }

      const data = await response.json()
      setMembers(data.members || [])
    } catch (error) {
      console.error("Error fetching members:", error)
      toast.error("Failed to load members")
    } finally {
      setLoading(false)
    }
  }, [organization.id])
  useEffect(() => {
    if (organization && open) {
      fetchMembers()
    }
  }, [organization, open, fetchMembers])



  const handleRoleChange = async (memberId: string, newRole: string) => {
    try {
      const response = await fetch(`/api/organizations/${organization.id}/members/${memberId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to update member role')
      }

      toast.success("Member role updated successfully")
      fetchMembers() // Refresh the members list
      onSuccess() // Refresh the organizations list
    } catch (error) {
      console.error("Error updating member role:", error)
      toast.error(error instanceof Error ? error.message : "Failed to update member role")
    }
  }

  const handleRemoveMember = async (member: OrganizationMember) => {
    setMemberToRemove(member)
  }

  const confirmRemoveMember = async () => {
    if (!memberToRemove) return

    try {
      setRemovingMember(memberToRemove.id)
      
      const response = await fetch(`/api/organizations/${organization.id}/members/${memberToRemove.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to remove member')
      }

      toast.success("Member removed successfully")
      fetchMembers() // Refresh the members list
      onSuccess() // Refresh the organizations list
      setMemberToRemove(null)
    } catch (error) {
      console.error("Error removing member:", error)
      toast.error(error instanceof Error ? error.message : "Failed to remove member")
    } finally {
      setRemovingMember(null)
    }
  }

  const filteredMembers = members.filter(member =>
    member.user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.user.email.toLowerCase().includes(searchQuery.toLowerCase())
  )
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <Crown className="h-4 w-4 text-yellow-500" />
      case 'VIEWER':
        return <ShieldCheck className="h-4 w-4 text-blue-500" />
      default:
        return <User className="h-4 w-4 text-gray-500" />
    }
  }
  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'default'
      case 'VIEWER':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Manage Organization
            </DialogTitle>
            <DialogDescription>
              Manage members and roles for {organization.name}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 space-y-4 overflow-hidden">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Members List */}
            <div className="flex-1 overflow-y-auto space-y-2 max-h-[400px]">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : filteredMembers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {searchQuery ? "No members match your search." : "No members found."}
                </div>
              ) : (
                filteredMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={member.user.image || ""} />
                        <AvatarFallback>
                          {member.user.name?.slice(0, 2).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium truncate">
                            {member.user.name || "Unnamed User"}
                          </p>
                          {getRoleIcon(member.role)}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          <span className="truncate">{member.user.email}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Joined {new Date(member.joinedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant={getRoleBadgeVariant(member.role)}>
                        {member.role}
                      </Badge>
                      
                      <Select
                        value={member.role}
                        onValueChange={(newRole) => handleRoleChange(member.id, newRole)}
                      >
                        <SelectTrigger className="w-[100px] h-8">
                          <SelectValue />
                        </SelectTrigger>                        <SelectContent>
                          <SelectItem value="USER">User</SelectItem>
                          <SelectItem value="VIEWER">Viewer</SelectItem>
                          <SelectItem value="ADMIN">Admin</SelectItem>
                        </SelectContent>
                      </Select>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveMember(member)}
                        disabled={removingMember === member.id}
                      >
                        {removingMember === member.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <UserMinus className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Summary */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Total Members: {members.length}</span>                <span>
                  Admins: {members.filter(m => m.role === 'ADMIN').length} | 
                  Viewers: {members.filter(m => m.role === 'VIEWER').length} | 
                  Users: {members.filter(m => m.role === 'USER').length}
                </span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Remove Member Confirmation */}
      <AlertDialog open={!!memberToRemove} onOpenChange={() => setMemberToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {memberToRemove?.user.name || memberToRemove?.user.email} from {organization.name}? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRemoveMember}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove Member
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

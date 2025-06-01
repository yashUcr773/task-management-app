"use client"

import { useState, useEffect } from "react"
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
import { Button } from "@/components/ui/button"
import { 
  Users, 
  Search,
  User,
  Mail,
  Calendar,
  Shield,
  Crown,
} from "lucide-react"
import { format } from "date-fns"

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
}

interface OrganizationMembersModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  organization: Organization | null
  members?: OrganizationMember[]
}

export function OrganizationMembersModal({
  open,
  onOpenChange,
  organization,
  members: propMembers,
}: OrganizationMembersModalProps) {
  const [members, setMembers] = useState<OrganizationMember[]>([])
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    if (propMembers) {
      setMembers(propMembers)
    } else {
      setMembers([])
    }
  }, [propMembers])

  const filteredMembers = members.filter(member =>
    member.user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.role.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getRoleColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "USER":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "VIEWER":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "ADMIN":
        return <Crown className="h-4 w-4" />
      case "USER":
        return <User className="h-4 w-4" />
      case "VIEWER":
        return <Shield className="h-4 w-4" />
      default:
        return <User className="h-4 w-4" />
    }
  }

  if (!organization) return null

  const memberStats = {
    total: members.length,
    admins: members.filter(m => m.role === 'ADMIN').length,
    users: members.filter(m => m.role === 'USER').length,
    viewers: members.filter(m => m.role === 'VIEWER').length,
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {organization.name} - Members
          </DialogTitle>
          <DialogDescription>
            {organization.description || "View and manage organization members"}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 space-y-4 overflow-hidden">
          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-4">
            <div className="p-3 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{memberStats.total}</div>
              <div className="text-xs text-muted-foreground">Total Members</div>
            </div>
            <div className="p-3 border rounded-lg">
              <div className="text-2xl font-bold text-red-600">{memberStats.admins}</div>
              <div className="text-xs text-muted-foreground">Admins</div>
            </div>
            <div className="p-3 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{memberStats.users}</div>
              <div className="text-xs text-muted-foreground">Users</div>
            </div>
            <div className="p-3 border rounded-lg">
              <div className="text-2xl font-bold text-gray-600">{memberStats.viewers}</div>
              <div className="text-xs text-muted-foreground">Viewers</div>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search members by name, email, or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Members List */}
          <div className="flex-1 overflow-y-auto space-y-3 max-h-[400px] pr-2">
            {filteredMembers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                {searchQuery ? (
                  <p>No members match your search.</p>
                ) : (
                  <p>No members found in this organization.</p>
                )}
              </div>
            ) : (
              filteredMembers.map((member) => (
                <div
                  key={member.id}
                  className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={member.user.image || undefined} />
                        <AvatarFallback className="text-sm font-medium">
                          {member.user.name?.slice(0, 2).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-semibold truncate">
                            {member.user.name || "Unnamed User"}
                          </h4>
                          <Badge 
                            variant="secondary" 
                            className={`text-xs ${getRoleColor(member.role)} flex items-center gap-1`}
                          >
                            {getRoleIcon(member.role)}
                            {member.role}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            <span className="truncate">{member.user.email}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>Joined {format(new Date(member.joinedAt), "MMM d, yyyy")}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Summary */}
          {filteredMembers.length > 0 && (
            <div className="border-t pt-4">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>
                  Showing {filteredMembers.length} of {members.length} members
                </span>
                <div className="flex items-center gap-4">
                  <span>Admins: {memberStats.admins}</span>
                  <span>Users: {memberStats.users}</span>
                  <span>Viewers: {memberStats.viewers}</span>
                </div>
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

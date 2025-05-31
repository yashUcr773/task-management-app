"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { UserPlus, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface JoinOrganizationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function JoinOrganizationDialog({
  open,
  onOpenChange,
  onSuccess,
}: JoinOrganizationDialogProps) {
  const [inviteCode, setInviteCode] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!inviteCode.trim()) {
      toast.error("Invite code is required")
      return
    }

    try {
      setLoading(true)
      
      const response = await fetch('/api/organizations/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inviteCode: inviteCode.trim(),
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to join organization')
      }

      const data = await response.json()
      
      toast.success(`Successfully joined ${data.organization.name}!`)
      
      // Reset form
      setInviteCode("")
      
      // Close dialog and refresh organizations
      onOpenChange(false)
      onSuccess()
      
    } catch (error) {
      console.error("Error joining organization:", error)
      toast.error(error instanceof Error ? error.message : "Failed to join organization")
    } finally {
      setLoading(false)
    }
  }
  const handleCancel = () => {
    setInviteCode("")
    onOpenChange(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInviteCode(value)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Join Organization
          </DialogTitle>
          <DialogDescription>
            Enter an invite code or paste an invite link to join an organization.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="inviteCode">Invite Code or Link *</Label>
              <Input
                id="inviteCode"
                value={inviteCode}
                onChange={handleInputChange}
                placeholder="Enter invite code or paste invite link"
                required
                disabled={loading}
              />
              <p className="text-sm text-muted-foreground">
                You can paste a full invite link or just the invite code.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !inviteCode.trim()}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Joining...
                </>
              ) : (
                "Join Organization"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

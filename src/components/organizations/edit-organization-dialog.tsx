"use client"

import { useState, useEffect } from "react"
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
import { Textarea } from "@/components/ui/textarea"
import { Edit, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface Organization {
  id: string
  name: string
  description: string | null
  createdAt: string
  updatedAt: string
}

interface EditOrganizationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  organization: Organization
  onSuccess: () => void
}

export function EditOrganizationDialog({
  open,
  onOpenChange,
  organization,
  onSuccess,
}: EditOrganizationDialogProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)

  // Reset form when organization changes
  useEffect(() => {
    if (organization) {
      setName(organization.name)
      setDescription(organization.description || "")
    }
  }, [organization])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim()) {
      toast.error("Organization name is required")
      return
    }

    try {
      setLoading(true)
      
      const response = await fetch(`/api/organizations/${organization.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to update organization')
      }

      const data = await response.json()
      console.log("🚀 ~ handleSubmit ~ data:", data)
      
      toast.success("Organization updated successfully!")
      
      // Close dialog and refresh organizations
      onOpenChange(false)
      onSuccess()
      
    } catch (error) {
      console.error("Error updating organization:", error)
      toast.error(error instanceof Error ? error.message : "Failed to update organization")
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    // Reset to original values
    setName(organization.name)
    setDescription(organization.description || "")
    onOpenChange(false)
  }

  const hasChanges = () => {
    return (
      name.trim() !== organization.name ||
      (description.trim() || null) !== organization.description
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Edit Organization
          </DialogTitle>
          <DialogDescription>
            Update your organization&apos;s details.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Organization Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter organization name"
                required
                disabled={loading}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your organization's purpose and goals"
                rows={3}
                disabled={loading}
              />
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
            <Button 
              type="submit" 
              disabled={loading || !name.trim() || !hasChanges()}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Organization"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { MessageSquare, Send } from "lucide-react"
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"

interface User {
  id: string
  name: string | null
  email: string
  image: string | null
}

interface Comment {
  id: string
  content: string
  createdAt: string
  updatedAt: string
  user: User
}

interface CommentsResponse {
  comments: Comment[]
}

interface TaskCommentsProps {
  taskId: string
}

export function TaskComments({ taskId }: TaskCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  
  useEffect(() => {
    fetchComments()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskId])

  const fetchComments = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/tasks/${taskId}/comments`)
      if (!response.ok) {
        throw new Error("Failed to fetch comments")
      }

      const data: CommentsResponse = await response.json()
      setComments(data.comments)
    } catch (error) {
      console.error("Failed to fetch comments:", error)
      toast.error("Failed to load comments")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newComment.trim()) {
      return
    }

    try {
      setSubmitting(true)
      const response = await fetch(`/api/tasks/${taskId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: newComment.trim(),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to add comment")
      }

      const data = await response.json()
      setComments(prev => [data.comment, ...prev])
      setNewComment("")
      toast.success("Comment added successfully")
    } catch (error) {
      console.error("Failed to add comment:", error)
      toast.error(error instanceof Error ? error.message : "Failed to add comment")
    } finally {
      setSubmitting(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      handleSubmit(e as any)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5" />
            <span>Comments</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-sm text-muted-foreground">Loading comments...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MessageSquare className="h-5 w-5" />
          <span>Comments</span>
          <span className="text-sm font-normal text-muted-foreground">
            ({comments.length})
          </span>
        </CardTitle>
        <CardDescription>
          Collaborate with your team on this task
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add Comment Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            placeholder="Add a comment... (Ctrl+Enter to submit)"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={handleKeyDown}
            className="min-h-[80px] resize-none"
            disabled={submitting}
          />
          <div className="flex justify-between items-center">
            <div className="text-xs text-muted-foreground">
              Press Ctrl+Enter to submit
            </div>
            <Button
              type="submit"
              size="sm"
              disabled={!newComment.trim() || submitting}
            >
              <Send className="h-4 w-4 mr-2" />
              {submitting ? "Adding..." : "Add Comment"}
            </Button>
          </div>
        </form>

        {/* Comments List */}
        {comments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <MessageSquare className="h-8 w-8 text-muted-foreground mb-2" />
            <div className="text-sm text-muted-foreground">
              No comments yet. Be the first to comment!
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment, index) => (
              <div key={comment.id}>
                <div className="flex items-start space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage 
                      src={comment.user.image || ""} 
                      alt={comment.user.name || ""} 
                    />
                    <AvatarFallback className="text-sm">
                      {comment.user.name?.slice(0, 2).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">
                        {comment.user.name || comment.user.email}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(comment.createdAt), { 
                          addSuffix: true 
                        })}
                      </span>
                    </div>
                    <div className="text-sm text-foreground whitespace-pre-wrap">
                      {comment.content}
                    </div>
                  </div>
                </div>
                {index < comments.length - 1 && <Separator className="mt-4" />}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

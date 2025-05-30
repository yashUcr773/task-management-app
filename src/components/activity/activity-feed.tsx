"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Activity,
  Plus,
  Edit,
  UserPlus,
  CheckCircle,
  Trash2,
  MessageSquare,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Filter,
  RefreshCw
} from "lucide-react"
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"

interface User {
  id: string
  name: string | null
  email: string
  image: string | null
}

interface Task {
  id: string
  title: string
  shareableId: string
}

interface ActivityItem {
  id: string
  type: string
  description: string
  taskId?: string
  metadata?: string
  createdAt: string
  user: User
  task?: Task
}

interface ActivitiesResponse {
  activities: ActivityItem[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

const getActivityIcon = (type: string) => {
  switch (type) {
    case "TASK_CREATED":
      return <Plus className="h-4 w-4 text-green-500" />
    case "TASK_UPDATED":
      return <Edit className="h-4 w-4 text-blue-500" />
    case "TASK_ASSIGNED":
      return <UserPlus className="h-4 w-4 text-purple-500" />
    case "TASK_COMPLETED":
      return <CheckCircle className="h-4 w-4 text-green-500" />
    case "TASK_DELETED":
      return <Trash2 className="h-4 w-4 text-red-500" />
    case "COMMENT_ADDED":
      return <MessageSquare className="h-4 w-4 text-blue-500" />
    case "STATUS_CHANGED":
      return <ArrowUpRight className="h-4 w-4 text-orange-500" />
    case "PRIORITY_CHANGED":
      return <ArrowDownRight className="h-4 w-4 text-yellow-500" />
    default:
      return <Activity className="h-4 w-4 text-muted-foreground" />
  }
}

const getActivityMessage = (activity: ActivityItem) => {
  const { type, description, metadata, user, task } = activity
  const userName = user.name || user.email
  
  // If we have a description, use it
  if (description) {
    return description
  }
  
  // Fallback to generating message from type
  const parsedMetadata = metadata ? JSON.parse(metadata) : {}
  
  switch (type) {
    case "TASK_CREATED":
      return `${userName} created task "${task?.title || 'Unknown'}"`
    case "TASK_UPDATED":
      return `${userName} updated task "${task?.title || 'Unknown'}"`
    case "TASK_ASSIGNED":
      return `${userName} assigned task "${task?.title || 'Unknown'}"`
    case "TASK_COMPLETED":
      return `${userName} completed task "${task?.title || 'Unknown'}"`
    case "TASK_DELETED":
      return `${userName} deleted a task`
    case "COMMENT_ADDED":
      return `${userName} added a comment`
    case "STATUS_CHANGED":
      return `${userName} changed status${parsedMetadata?.from ? ` from ${parsedMetadata.from}` : ""}${parsedMetadata?.to ? ` to ${parsedMetadata.to}` : ""}`
    case "PRIORITY_CHANGED":
      return `${userName} changed priority${parsedMetadata?.from ? ` from ${parsedMetadata.from}` : ""}${parsedMetadata?.to ? ` to ${parsedMetadata.to}` : ""}`
    default:
      return `${userName} performed an action`
  }
}

const getActivityBadgeVariant = (type: string) => {
  switch (type) {
    case "TASK_CREATED":
    case "TASK_COMPLETED":
      return "default"
    case "TASK_UPDATED":
    case "COMMENT_ADDED":
      return "secondary"
    case "TASK_ASSIGNED":
      return "outline"
    case "TASK_DELETED":
      return "destructive"
    default:
      return "secondary"
  }
}

export function ActivityFeed() {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  })
    const [filters, setFilters] = useState({
    taskId: "",
    type: "all",
  })

  useEffect(() => {
    fetchActivities(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  const fetchActivities = async (reset = false) => {
    if (reset) {
      setLoading(true)
    } else {
      setRefreshing(true)
    }

    try {
      const params = new URLSearchParams({
        page: reset ? "1" : pagination.page.toString(),
        limit: pagination.limit.toString(),
      })

      if (filters.taskId) {
        params.append("taskId", filters.taskId)
      }

      const response = await fetch(`/api/activities?${params}`)
      if (!response.ok) {
        throw new Error("Failed to fetch activities")
      }

      const data: ActivitiesResponse = await response.json()
      
      if (reset) {
        setActivities(data.activities)
      } else {
        setActivities(prev => [...prev, ...data.activities])
      }
      
      setPagination(data.pagination)
    } catch (error) {
      console.error("Failed to fetch activities:", error)
      toast.error("Failed to load activities")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleLoadMore = () => {
    if (pagination.page < pagination.pages) {
      setPagination(prev => ({ ...prev, page: prev.page + 1 }))
      fetchActivities()
    }
  }

  const handleRefresh = () => {
    fetchActivities(true)
  }

  const handleFilterChange = (type: string, value: string) => {
    setFilters(prev => ({ ...prev, [type]: value }))
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>Activity Feed</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-sm text-muted-foreground">Loading activities...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Activity Feed</span>
            </CardTitle>
            <CardDescription>
              Recent activity across your workspace
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>        {/* Filters */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select
              value={filters.type}
              onValueChange={(value) => handleFilterChange("type", value)}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="TASK_CREATED">Created</SelectItem>
                <SelectItem value="TASK_UPDATED">Updated</SelectItem>
                <SelectItem value="TASK_ASSIGNED">Assigned</SelectItem>
                <SelectItem value="TASK_COMPLETED">Completed</SelectItem>
                <SelectItem value="COMMENT_ADDED">Comments</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Activity className="h-8 w-8 text-muted-foreground mb-2" />
            <div className="text-sm text-muted-foreground">No activities found</div>
          </div>
        ) : (          <div className="space-y-4">
            {activities.map((activity, index) => {
              const parsedMetadata = activity.metadata ? JSON.parse(activity.metadata) : {}
              
              return (
                <div key={activity.id}>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={activity.user.image || ""} alt={activity.user.name || ""} />
                            <AvatarFallback className="text-xs">
                              {activity.user.name?.slice(0, 2).toUpperCase() || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <p className="text-sm text-foreground">
                            {getActivityMessage(activity)}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge 
                            variant={getActivityBadgeVariant(activity.type)}
                            className="text-xs px-2 py-1"
                          >
                            {activity.type.replace("_", " ").toLowerCase()}
                          </Badge>
                        </div>
                      </div>
                      
                      {parsedMetadata?.title && (
                        <p className="text-sm font-medium text-muted-foreground ml-8">
                          "{parsedMetadata.title}"
                        </p>
                      )}
                      
                      <div className="flex items-center space-x-4 ml-8 text-xs text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>
                            {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        {activity.task && (
                          <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                            task
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  {index < activities.length - 1 && <Separator className="mt-4" />}
                </div>
              )
            })}

            {pagination.page < pagination.pages && (
              <div className="flex justify-center pt-4">
                <Button
                  variant="outline"
                  onClick={handleLoadMore}
                  disabled={refreshing}
                >
                  Load More Activities
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

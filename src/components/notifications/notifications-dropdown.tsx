"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  Bell, 
  BellRing, 
  Check, 
  CheckCheck, 
  Info, 
  AlertCircle, 
  AlertTriangle,
  CheckCircle,
  Clock,
  ExternalLink
} from "lucide-react"
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"

interface Notification {
  id: string
  title: string
  message: string
  type: "info" | "success" | "warning" | "error"
  readAt: string | null
  actionUrl?: string
  metadata?: Record<string, any>
  createdAt: string
  updatedAt: string
}

interface NotificationsResponse {
  notifications: Notification[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
  unreadCount: number
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "success":
      return <CheckCircle className="h-4 w-4 text-green-500" />
    case "warning":
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />
    case "error":
      return <AlertCircle className="h-4 w-4 text-red-500" />
    default:
      return <Info className="h-4 w-4 text-blue-500" />
  }
}

const getNotificationBadgeVariant = (type: string) => {
  switch (type) {
    case "success":
      return "default"
    case "warning":
      return "secondary"
    case "error":
      return "destructive"
    default:
      return "outline"
  }
}

export function NotificationsDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (open) {
      fetchNotifications()
    }
  }, [open])

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/notifications?limit=10")
      if (!response.ok) {
        throw new Error("Failed to fetch notifications")
      }
      const data: NotificationsResponse = await response.json()
      setNotifications(data.notifications)
      setUnreadCount(data.unreadCount)
    } catch (error) {
      console.error("Failed to fetch notifications:", error)
      toast.error("Failed to load notifications")
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationIds: string[]) => {
    try {
      const response = await fetch("/api/notifications", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ notificationIds }),
      })

      if (!response.ok) {
        throw new Error("Failed to mark notifications as read")
      }

      // Update local state
      setNotifications(prev =>
        prev.map(notif =>
          notificationIds.includes(notif.id)
            ? { ...notif, readAt: new Date().toISOString() }
            : notif
        )
      )
      setUnreadCount(prev => Math.max(0, prev - notificationIds.length))
    } catch (error) {
      console.error("Failed to mark notifications as read:", error)
      toast.error("Failed to update notifications")
    }
  }

  const markAllAsRead = async () => {
    try {
      const response = await fetch("/api/notifications", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ markAllAsRead: true }),
      })

      if (!response.ok) {
        throw new Error("Failed to mark all notifications as read")
      }

      // Update local state
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, readAt: new Date().toISOString() }))
      )
      setUnreadCount(0)
      toast.success("All notifications marked as read")
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error)
      toast.error("Failed to update notifications")
    }
  }

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.readAt) {
      markAsRead([notification.id])
    }
    
    if (notification.actionUrl) {
      window.open(notification.actionUrl, "_blank")
    }
    
    setOpen(false)
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          {unreadCount > 0 ? (
            <BellRing className="h-4 w-4" />
          ) : (
            <Bell className="h-4 w-4" />
          )}
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs p-0"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 max-h-96 overflow-y-auto" align="end">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={markAllAsRead}
              className="h-6 px-2 text-xs"
            >
              <CheckCheck className="h-3 w-3 mr-1" />
              Mark all read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {loading ? (
          <div className="flex items-center justify-center py-4">
            <div className="text-sm text-muted-foreground">Loading notifications...</div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Bell className="h-8 w-8 text-muted-foreground mb-2" />
            <div className="text-sm text-muted-foreground">No notifications</div>
          </div>
        ) : (
          <div className="space-y-1">
            {notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className="flex flex-col items-start p-3 cursor-pointer hover:bg-accent"
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start space-x-3 w-full">
                  <div className="flex-shrink-0 mt-0.5">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-foreground truncate">
                        {notification.title}
                      </p>
                      <div className="flex items-center space-x-2">
                        {!notification.readAt && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                        )}
                        {notification.actionUrl && (
                          <ExternalLink className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {notification.message}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant={getNotificationBadgeVariant(notification.type)}
                          className="text-xs px-1.5 py-0.5"
                        >
                          {notification.type}
                        </Badge>
                        <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>
                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                      {!notification.readAt && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            markAsRead([notification.id])
                          }}
                          className="h-6 px-2 text-xs"
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
          </div>
        )}
        
        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Button variant="ghost" className="w-full justify-center text-sm">
                View all notifications
              </Button>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

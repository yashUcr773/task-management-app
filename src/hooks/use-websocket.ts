// WebSocket hook for React components
"use client"

import { useEffect, useRef, useState } from 'react'
import { useSession } from 'next-auth/react'
import { getWebSocketClient, type WebSocketMessage } from '@/lib/websocket'

export function useWebSocket(organizationId?: string) {
  const { data: session } = useSession()
  const [isConnected, setIsConnected] = useState(false)
  const clientRef = useRef(getWebSocketClient())
  const subscriptionsRef = useRef<(() => void)[]>([])

  useEffect(() => {
    if (!session?.user?.id) return

    const client = clientRef.current

    // Connect WebSocket
    client.connect(session.user.id, organizationId)

    // Monitor connection state
    const checkConnection = () => {
      const state = client.getConnectionState()
      setIsConnected(state.isConnected)
    }

    const interval = setInterval(checkConnection, 1000)
    checkConnection()

    return () => {
      clearInterval(interval)
      // Clean up subscriptions
      subscriptionsRef.current.forEach(unsubscribe => unsubscribe())
      subscriptionsRef.current = []
    }
  }, [session?.user?.id, organizationId])

  const subscribe = (
    type: string,
    listener: (message: WebSocketMessage) => void
  ) => {
    const client = clientRef.current
    const unsubscribe = client.subscribe(type, listener)
    subscriptionsRef.current.push(unsubscribe)
    return unsubscribe
  }

  const send = (message: Omit<WebSocketMessage, 'timestamp'>) => {
    const client = clientRef.current
    client.send(message)
  }

  return {
    isConnected,
    subscribe,
    send,
    client: clientRef.current
  }
}

// Specific hooks for different features
export function useTaskUpdates(onTaskUpdate?: (task: any) => void) {
  const { subscribe } = useWebSocket()

  useEffect(() => {
    if (!onTaskUpdate) return

    const unsubscribeCreated = subscribe('task_created', (message) => {
      onTaskUpdate({ ...message.payload, _action: 'created' })
    })

    const unsubscribeUpdated = subscribe('task_updated', (message) => {
      onTaskUpdate({ ...message.payload, _action: 'updated' })
    })

    const unsubscribeDeleted = subscribe('task_deleted', (message) => {
      onTaskUpdate({ ...message.payload, _action: 'deleted' })
    })

    return () => {
      unsubscribeCreated()
      unsubscribeUpdated()
      unsubscribeDeleted()
    }
  }, [subscribe, onTaskUpdate])
}

export function useCommentUpdates(taskId: string, onCommentUpdate?: (comment: any) => void) {
  const { subscribe } = useWebSocket()

  useEffect(() => {
    if (!onCommentUpdate) return

    const unsubscribe = subscribe('comment_added', (message) => {
      if (message.payload.taskId === taskId) {
        onCommentUpdate(message.payload)
      }
    })

    return unsubscribe
  }, [subscribe, taskId, onCommentUpdate])
}

export function useNotificationUpdates(onNotificationUpdate?: (notification: any) => void) {
  const { subscribe } = useWebSocket()

  useEffect(() => {
    if (!onNotificationUpdate) return

    const unsubscribe = subscribe('notification_created', (message) => {
      onNotificationUpdate(message.payload)
    })

    return unsubscribe
  }, [subscribe, onNotificationUpdate])
}

export function usePresence() {
  const { subscribe, send, isConnected } = useWebSocket()
  const [onlineUsers, setOnlineUsers] = useState<string[]>([])

  useEffect(() => {
    const unsubscribeJoined = subscribe('user_joined', (message) => {
      setOnlineUsers(prev => [...prev.filter(id => id !== message.payload.userId), message.payload.userId])
    })

    const unsubscribeLeft = subscribe('user_left', (message) => {
      setOnlineUsers(prev => prev.filter(id => id !== message.payload.userId))
    })

    return () => {
      unsubscribeJoined()
      unsubscribeLeft()
    }
  }, [subscribe])

  const joinRoom = (roomId: string) => {
    send({
      type: 'user_joined',
      payload: { roomId }
    })
  }

  const leaveRoom = (roomId: string) => {
    send({
      type: 'user_left',
      payload: { roomId }
    })
  }

  return {
    onlineUsers,
    joinRoom,
    leaveRoom,
    isConnected
  }
}

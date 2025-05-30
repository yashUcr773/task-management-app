// WebSocket client utility for real-time features
"use client"

import { toast } from "sonner"

export interface WebSocketMessage {
  type: 'task_updated' | 'task_created' | 'task_deleted' | 'comment_added' | 'notification_created' | 'user_joined' | 'user_left'
  payload: any
  userId?: string
  organizationId?: string
  teamId?: string
  timestamp: string
}

export class WebSocketClient {
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private listeners: Map<string, ((message: WebSocketMessage) => void)[]> = new Map()
  private url: string
  private isConnected = false

  constructor(url: string = process.env.NODE_ENV === 'production' ? 'wss://your-domain.com/ws' : 'ws://localhost:3002') {
    this.url = url
  }

  connect(userId: string, organizationId?: string) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return
    }

    try {
      const wsUrl = `${this.url}?userId=${userId}${organizationId ? `&organizationId=${organizationId}` : ''}`
      this.ws = new WebSocket(wsUrl)

      this.ws.onopen = () => {
        console.log('WebSocket connected')
        this.isConnected = true
        this.reconnectAttempts = 0
        toast.success('Connected to real-time updates')
      }

      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data)
          this.handleMessage(message)
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error)
        }
      }

      this.ws.onclose = () => {
        console.log('WebSocket disconnected')
        this.isConnected = false
        this.attemptReconnect(userId, organizationId)
      }

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error)
        toast.error('Real-time connection error')
      }
    } catch (error) {
      console.error('Failed to connect WebSocket:', error)
      this.attemptReconnect(userId, organizationId)
    }
  }

  private attemptReconnect(userId: string, organizationId?: string) {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      toast.error('Failed to establish real-time connection')
      return
    }

    this.reconnectAttempts++
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1)

    setTimeout(() => {
      console.log(`Reconnecting WebSocket (attempt ${this.reconnectAttempts})...`)
      this.connect(userId, organizationId)
    }, delay)
  }
  private handleMessage(message: WebSocketMessage) {
    const messageTypeListeners = this.listeners.get(message.type) || []
    const catchAllListeners = this.listeners.get('*') || []
    
    const allListenersArray = messageTypeListeners.concat(catchAllListeners)
    
    allListenersArray.forEach((listener: (message: WebSocketMessage) => void) => {
      try {
        listener(message)
      } catch (error) {
        console.error('Error in WebSocket message listener:', error)
      }
    })
  }

  subscribe(type: string, listener: (message: WebSocketMessage) => void) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, [])
    }
    this.listeners.get(type)!.push(listener)

    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(type)
      if (listeners) {
        const index = listeners.indexOf(listener)
        if (index > -1) {
          listeners.splice(index, 1)
        }
      }
    }
  }

  send(message: Omit<WebSocketMessage, 'timestamp'>) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      const fullMessage: WebSocketMessage = {
        ...message,
        timestamp: new Date().toISOString()
      }
      this.ws.send(JSON.stringify(fullMessage))
    } else {
      console.warn('WebSocket not connected, cannot send message:', message)
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
      this.isConnected = false
    }
  }

  getConnectionState() {
    return {
      isConnected: this.isConnected,
      readyState: this.ws?.readyState
    }
  }
}

// Global WebSocket client instance
let wsClient: WebSocketClient | null = null

export function getWebSocketClient(): WebSocketClient {
  if (!wsClient) {
    wsClient = new WebSocketClient()
  }
  return wsClient
}

export function initializeWebSocket(userId: string, organizationId?: string) {
  const client = getWebSocketClient()
  client.connect(userId, organizationId)
  return client
}

// Simple WebSocket server for testing real-time functionality
// Run this with: node websocket-server.js

const WebSocket = require('ws')
const http = require('http')
const url = require('url')

const server = http.createServer()
const wss = new WebSocket.Server({ server })

// Store connected clients
const clients = new Map()

// Sample task data for testing
let tasks = [
  {
    id: '1',
    title: 'Setup project infrastructure',
    description: 'Initialize the project with necessary tools and dependencies',
    status: 'done',
    priority: 'high',
    assigneeId: 'user1',
    assignee: {
      id: 'user1',
      name: 'John Doe',
      email: 'john@example.com',
      avatar: '/avatars/john.jpg'
    },
    dueDate: '2024-01-15',
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-01-05T15:30:00Z',
    organizationId: 'org1',
    teamId: 'team1',
    tags: ['setup', 'infrastructure'],
    estimatedHours: 8,
    actualHours: 6
  },
  {
    id: '2',
    title: 'Design user interface mockups',
    description: 'Create wireframes and mockups for the main user interface',
    status: 'in-progress',
    priority: 'medium',
    assigneeId: 'user2',
    assignee: {
      id: 'user2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      avatar: '/avatars/jane.jpg'
    },
    dueDate: '2024-01-20',
    createdAt: '2024-01-02T09:00:00Z',
    updatedAt: '2024-01-08T11:15:00Z',
    organizationId: 'org1',
    teamId: 'team1',
    tags: ['design', 'ui'],
    estimatedHours: 12,
    actualHours: 4
  }
]

wss.on('connection', (ws, request) => {
  const query = url.parse(request.url, true).query
  const userId = query.userId
  const organizationId = query.organizationId
  
  console.log(`Client connected: ${userId} (org: ${organizationId})`)
  
  // Store client with metadata
  clients.set(ws, {
    userId,
    organizationId,
    connectedAt: new Date()
  })

  // Send welcome message
  ws.send(JSON.stringify({
    type: 'connection_established',
    payload: {
      message: 'Connected to WebSocket server',
      userId,
      organizationId
    },
    timestamp: new Date().toISOString()
  }))

  // Handle incoming messages
  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data)
      console.log(`Received message from ${userId}:`, message)
      
      // Echo message back to all clients in the same organization
      broadcast(message, organizationId)
    } catch (error) {
      console.error('Error parsing message:', error)
    }
  })

  ws.on('close', () => {
    console.log(`Client disconnected: ${userId}`)
    clients.delete(ws)
  })

  ws.on('error', (error) => {
    console.error(`WebSocket error for ${userId}:`, error)
    clients.delete(ws)
  })
})

// Broadcast message to all clients in organization
function broadcast(message, organizationId) {
  const messageWithTimestamp = {
    ...message,
    timestamp: new Date().toISOString()
  }

  clients.forEach((clientInfo, ws) => {
    if (ws.readyState === WebSocket.OPEN && 
        (!organizationId || clientInfo.organizationId === organizationId)) {
      ws.send(JSON.stringify(messageWithTimestamp))
    }
  })
}

// Simulate real-time task updates for testing
function simulateTaskUpdates() {
  setInterval(() => {
    if (clients.size === 0) return

    // Randomly update a task
    const randomTask = tasks[Math.floor(Math.random() * tasks.length)]
    const updateTypes = ['updated', 'created', 'status_changed']
    const updateType = updateTypes[Math.floor(Math.random() * updateTypes.length)]
    
    let updatedTask = { ...randomTask }
    
    switch (updateType) {
      case 'updated':
        updatedTask.updatedAt = new Date().toISOString()
        updatedTask.title = randomTask.title + ' (updated)'
        break
      case 'status_changed':
        const statuses = ['todo', 'in-progress', 'review', 'done']
        updatedTask.status = statuses[Math.floor(Math.random() * statuses.length)]
        updatedTask.updatedAt = new Date().toISOString()
        break
      case 'created':
        updatedTask = {
          id: Date.now().toString(),
          title: `New task ${Date.now()}`,
          description: 'Auto-generated task for testing',
          status: 'todo',
          priority: 'medium',
          assigneeId: 'user1',
          assignee: {
            id: 'user1',
            name: 'John Doe',
            email: 'john@example.com'
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          organizationId: 'org1',
          teamId: 'team1',
          tags: ['auto-generated']
        }
        tasks.push(updatedTask)
        break
    }

    const message = {
      type: updateType === 'created' ? 'task_created' : 
            updateType === 'status_changed' ? 'task_updated' : 'task_updated',
      payload: { ...updatedTask, _action: updateType === 'created' ? 'created' : 'updated' },
      userId: 'system',
      organizationId: 'org1'
    }

    console.log(`Simulating ${updateType} for task:`, updatedTask.title)
    broadcast(message, 'org1')
  }, 10000) // Every 10 seconds
}

const PORT = process.env.WS_PORT || 3002

server.listen(PORT, () => {
  console.log(`WebSocket server listening on port ${PORT}`)
  console.log(`Test connection: ws://localhost:${PORT}?userId=test&organizationId=org1`)
  
  // Start simulation after 5 seconds
  setTimeout(() => {
    console.log('Starting task update simulation...')
    simulateTaskUpdates()
  }, 5000)
})

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down WebSocket server...')
  wss.close(() => {
    server.close(() => {
      console.log('Server closed')
      process.exit(0)
    })
  })
})

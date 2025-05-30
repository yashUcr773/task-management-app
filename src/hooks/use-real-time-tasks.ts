// Real-time tasks hook for task management components
"use client"

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useTaskUpdates } from './use-websocket'
import { toast } from 'sonner'

export interface Task {
  id: string
  title: string
  description?: string
  status: 'todo' | 'in-progress' | 'review' | 'done'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  assigneeId?: string
  assignee?: {
    id: string
    name: string
    email: string
    avatar?: string
  }
  dueDate?: string
  createdAt: string
  updatedAt: string
  organizationId: string
  teamId?: string
  tags?: string[]
  epicId?: string
  sprintId?: string
  estimatedHours?: number
  actualHours?: number
  _action?: 'created' | 'updated' | 'deleted'
}

interface UseRealTimeTasksOptions {
  organizationId?: string
  teamId?: string
  sprintId?: string
  epicId?: string
  assigneeId?: string
  status?: string[]
  enableRealTime?: boolean
  showToasts?: boolean
}

export function useRealTimeTasks(options: UseRealTimeTasksOptions = {}) {
  const {
    organizationId,
    teamId,
    sprintId,
    epicId,
    assigneeId,
    status,
    enableRealTime = true,
    showToasts = true
  } = options

  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  // Mock data for development - replace with actual API call
  const fetchTasks = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock task data
      const mockTasks: Task[] = [
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
        },
        {
          id: '3',
          title: 'Implement authentication system',
          description: 'Build user authentication with login, register, and password reset',
          status: 'todo',
          priority: 'high',
          assigneeId: 'user3',
          assignee: {
            id: 'user3',
            name: 'Bob Wilson',
            email: 'bob@example.com',
            avatar: '/avatars/bob.jpg'
          },
          dueDate: '2024-01-25',
          createdAt: '2024-01-03T14:00:00Z',
          updatedAt: '2024-01-03T14:00:00Z',
          organizationId: 'org1',
          teamId: 'team1',
          tags: ['backend', 'auth'],
          estimatedHours: 16,
          actualHours: 0
        },
        {
          id: '4',
          title: 'Write unit tests',
          description: 'Create comprehensive unit tests for core functionality',
          status: 'todo',
          priority: 'medium',
          assigneeId: 'user1',
          assignee: {
            id: 'user1',
            name: 'John Doe',
            email: 'john@example.com',
            avatar: '/avatars/john.jpg'
          },
          dueDate: '2024-01-30',
          createdAt: '2024-01-04T16:00:00Z',
          updatedAt: '2024-01-04T16:00:00Z',
          organizationId: 'org1',
          teamId: 'team1',
          tags: ['testing', 'quality'],
          estimatedHours: 10,
          actualHours: 0
        },
        {
          id: '5',
          title: 'Deploy to staging environment',
          description: 'Setup and deploy application to staging for testing',
          status: 'review',
          priority: 'low',
          assigneeId: 'user2',
          assignee: {
            id: 'user2',
            name: 'Jane Smith',
            email: 'jane@example.com',
            avatar: '/avatars/jane.jpg'
          },
          dueDate: '2024-02-05',
          createdAt: '2024-01-05T12:00:00Z',
          updatedAt: '2024-01-09T09:45:00Z',
          organizationId: 'org1',
          teamId: 'team1',
          tags: ['deployment', 'staging'],
          estimatedHours: 4,
          actualHours: 3
        }
      ]

      // Apply filters
      let filteredTasks = mockTasks

      if (organizationId) {
        filteredTasks = filteredTasks.filter(task => task.organizationId === organizationId)
      }

      if (teamId) {
        filteredTasks = filteredTasks.filter(task => task.teamId === teamId)
      }

      if (sprintId) {
        filteredTasks = filteredTasks.filter(task => task.sprintId === sprintId)
      }

      if (epicId) {
        filteredTasks = filteredTasks.filter(task => task.epicId === epicId)
      }

      if (assigneeId) {
        filteredTasks = filteredTasks.filter(task => task.assigneeId === assigneeId)
      }

      if (status && status.length > 0) {
        filteredTasks = filteredTasks.filter(task => status.includes(task.status))
      }

      setTasks(filteredTasks)
      setLastUpdate(new Date())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tasks')
      console.error('Error fetching tasks:', err)
    } finally {
      setIsLoading(false)
    }
  }, [organizationId, teamId, sprintId, epicId, assigneeId, status])

  // Handle real-time task updates
  const handleTaskUpdate = useCallback((updatedTask: Task) => {
    const action = updatedTask._action || 'updated'
    
    setTasks(prevTasks => {
      switch (action) {
        case 'created':
          // Add new task if it matches our filters
          const shouldInclude = (
            (!organizationId || updatedTask.organizationId === organizationId) &&
            (!teamId || updatedTask.teamId === teamId) &&
            (!sprintId || updatedTask.sprintId === sprintId) &&
            (!epicId || updatedTask.epicId === epicId) &&
            (!assigneeId || updatedTask.assigneeId === assigneeId) &&
            (!status || status.length === 0 || status.includes(updatedTask.status))
          )
          
          if (shouldInclude && !prevTasks.find(t => t.id === updatedTask.id)) {
            if (showToasts) {
              toast.success(`New task created: ${updatedTask.title}`)
            }
            return [...prevTasks, updatedTask]
          }
          return prevTasks

        case 'updated':
          const updatedTasks = prevTasks.map(task =>
            task.id === updatedTask.id ? { ...updatedTask } : task
          )
          
          if (showToasts) {
            const existingTask = prevTasks.find(t => t.id === updatedTask.id)
            if (existingTask) {
              toast.info(`Task updated: ${updatedTask.title}`)
            }
          }
          
          return updatedTasks

        case 'deleted':
          if (showToasts) {
            toast.error(`Task deleted: ${updatedTask.title}`)
          }
          return prevTasks.filter(task => task.id !== updatedTask.id)

        default:
          return prevTasks
      }
    })
    
    setLastUpdate(new Date())
  }, [organizationId, teamId, sprintId, epicId, assigneeId, status, showToasts])

  // Setup real-time updates
  useTaskUpdates(enableRealTime ? handleTaskUpdate : undefined)

  // Initial data fetch
  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  // Computed values
  const taskStats = useMemo(() => {
    const total = tasks.length
    const completed = tasks.filter(task => task.status === 'done').length
    const inProgress = tasks.filter(task => task.status === 'in-progress').length
    const todo = tasks.filter(task => task.status === 'todo').length
    const review = tasks.filter(task => task.status === 'review').length

    return {
      total,
      completed,
      inProgress,
      todo,
      review,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
    }
  }, [tasks])

  const tasksByStatus = useMemo(() => {
    return tasks.reduce((acc, task) => {
      if (!acc[task.status]) {
        acc[task.status] = []
      }
      acc[task.status].push(task)
      return acc
    }, {} as Record<string, Task[]>)
  }, [tasks])

  const overdueTasks = useMemo(() => {
    const now = new Date()
    return tasks.filter(task => {
      if (!task.dueDate || task.status === 'done') return false
      return new Date(task.dueDate) < now
    })
  }, [tasks])

  // Actions
  const refreshTasks = useCallback(() => {
    fetchTasks()
  }, [fetchTasks])

  const getTaskById = useCallback((id: string) => {
    return tasks.find(task => task.id === id)
  }, [tasks])

  const getTasksByAssignee = useCallback((assigneeId: string) => {
    return tasks.filter(task => task.assigneeId === assigneeId)
  }, [tasks])

  const getTasksByTag = useCallback((tag: string) => {
    return tasks.filter(task => task.tags?.includes(tag))
  }, [tasks])

  return {
    // Data
    tasks,
    isLoading,
    error,
    lastUpdate,
    
    // Computed values
    taskStats,
    tasksByStatus,
    overdueTasks,
    
    // Actions
    refreshTasks,
    getTaskById,
    getTasksByAssignee,
    getTasksByTag,
    
    // Metadata
    isEmpty: tasks.length === 0,
    hasError: !!error,
    isRealTimeEnabled: enableRealTime
  }
}

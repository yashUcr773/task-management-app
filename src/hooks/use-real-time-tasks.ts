// Real-time tasks hook for task management components
"use client"

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useTaskUpdates } from './use-websocket'
import { toast } from 'sonner'
import { TasksWithUsersAndTags } from '@/types/all-types'

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

  const [tasks, setTasks] = useState<TasksWithUsersAndTags[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)  // Fetch tasks from API with filters
  const fetchTasks = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Build query parameters for filtering
      const params = new URLSearchParams()
      if (organizationId) params.append('organizationId', organizationId)
      if (teamId) params.append('teamId', teamId)
      if (sprintId) params.append('sprintId', sprintId)
      if (epicId) params.append('epicId', epicId)
      if (assigneeId) params.append('assigneeId', assigneeId)
      if (status && status.length > 0) {
        status.forEach(s => params.append('status', s))
      }

      const response = await fetch(`/api/tasks?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch tasks')
      }
      
      const data = await response.json()
      const fetchedTasks = data.tasks || []

      setTasks(fetchedTasks)
      setLastUpdate(new Date())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tasks')
      console.error('Error fetching tasks:', err)
      // Fallback to empty array on error
      setTasks([])
    } finally {
      setIsLoading(false)
    }
  }, [organizationId, teamId, sprintId, epicId, assigneeId, status])  // Handle real-time task updates
  const handleTaskUpdate = useCallback((updatedTask: TasksWithUsersAndTags) => {
    // Handle _action property when available from WebSocket messages
    const action = (updatedTask as any)._action || 'updated'
    
    setTasks(prevTasks => {
      switch (action) {
        case 'created':          // Add new task if it matches our filters
          const shouldInclude = (
            (!organizationId || (updatedTask as any).organizationId === organizationId) &&
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
    const completed = tasks.filter(task => task.status === 'RELEASED').length
    const inProgress = tasks.filter(task => task.status === 'IN_DEV').length
    const todo = tasks.filter(task => task.status === 'TODO').length
    const review = tasks.filter(task => task.status === 'WITH_QA').length

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
    }, {} as Record<string, TasksWithUsersAndTags[]>)
  }, [tasks])
  const overdueTasks = useMemo(() => {
    const now = new Date()
    return tasks.filter(task => {
      if (!task.dueDate || task.status === 'RELEASED') return false
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
    return tasks.filter(task => task.tags?.some(t => t.name === tag))
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

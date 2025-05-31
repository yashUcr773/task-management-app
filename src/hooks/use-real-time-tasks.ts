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
  showArchived?: boolean
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
    showArchived = false,
    enableRealTime = true,
    showToasts = true
  } = options

  const [tasks, setTasks] = useState<TasksWithUsersAndTags[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  // Fetch tasks from API with filters
  const fetchTasks = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {      // Build query parameters for filtering
      const params = new URLSearchParams()
      if (organizationId) params.append('organizationId', organizationId)
      if (teamId) params.append('teamId', teamId)
      if (sprintId) params.append('sprintId', sprintId)
      if (epicId) params.append('epicId', epicId)
      if (assigneeId) params.append('assigneeId', assigneeId)
      if (status && status.length > 0) {
        status.forEach(s => params.append('status', s))
      }
      if (showArchived) params.append('showArchived', 'true')

      const response = await fetch(`/api/tasks?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch tasks: ${response.statusText}`)
      }

      const data = await response.json()
      setTasks(data.tasks || [])
      setLastUpdate(new Date())
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch tasks'
      setError(errorMessage)
      console.error('Error fetching tasks:', err)
      
      if (showToasts) {
        toast.error(errorMessage)
      }    } finally {
      setIsLoading(false)
    }
  }, [organizationId, teamId, sprintId, epicId, assigneeId, status, showArchived, showToasts])

  // Handle real-time task updates
  const handleTaskUpdate = useCallback((updatedTask: TasksWithUsersAndTags & { _action?: string }) => {
    // Handle _action property when available from WebSocket messages
    const action = updatedTask._action || 'updated'
    
    setTasks(prevTasks => {      // Filter logic: check if the task matches current filter criteria
      const matchesFilter = (task: TasksWithUsersAndTags) => {
        // Check organizationId through team relationship
        if (organizationId && task.team?.organizationId !== organizationId) return false
        if (teamId && task.teamId !== teamId) return false
        if (sprintId && task.sprintId !== sprintId) return false
        if (epicId && task.epicId !== epicId) return false
        if (assigneeId && task.assigneeId !== assigneeId) return false
        if (status && status.length > 0 && !status.includes(task.status)) return false
        // Check archived status - only show archived tasks if showArchived is true
        if (showArchived && !task.isArchived) return false
        if (!showArchived && task.isArchived) return false
        return true
      }

      switch (action) {
        case 'created':
          // Add task if it matches current filters
          if (matchesFilter(updatedTask)) {
            // Check if task already exists to avoid duplicates
            const exists = prevTasks.some(t => t.id === updatedTask.id)
            if (!exists) {
              if (showToasts) {
                toast.success(`New task created: ${updatedTask.title}`)
              }
              return [updatedTask, ...prevTasks]
            }
          }
          return prevTasks
          
        case 'updated':
          return prevTasks.map(task => {
            if (task.id === updatedTask.id) {
              // If task no longer matches filters, remove it
              if (!matchesFilter(updatedTask)) {
                if (showToasts) {
                  toast.info(`Task moved out of current view: ${updatedTask.title}`)
                }
                return null
              }
              
              if (showToasts && task.status !== updatedTask.status) {
                toast.info(`Task status updated: ${updatedTask.title}`)
              }
              return updatedTask
            }
            return task
          }).filter(Boolean) as TasksWithUsersAndTags[]
          
        case 'deleted':
          const taskExists = prevTasks.some(t => t.id === updatedTask.id)
          if (taskExists && showToasts) {
            toast.info(`Task deleted: ${updatedTask.title}`)
          }
          return prevTasks.filter(task => task.id !== updatedTask.id)
          
        default:
          return prevTasks
      }
    })
      setLastUpdate(new Date())
  }, [organizationId, teamId, sprintId, epicId, assigneeId, status, showArchived, showToasts])

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
      const status = task.status
      if (!acc[status]) {
        acc[status] = []
      }
      acc[status].push(task)
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

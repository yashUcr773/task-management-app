"use client"

import { useState, useEffect, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Filter, X, Calendar, User, Flag, Layers, Target } from "lucide-react"

interface User {
  id: string
  name: string | null
  email: string
}

interface Epic {
  id: string
  title: string
  description: string | null
}

interface Sprint {
  id: string
  name: string
  startDate: string
  endDate: string
  isActive: boolean
}

interface TaskFiltersProps {
  onFiltersChange: (filters: FilterState) => void
  hasActiveFilters: boolean
  onClearFilters: () => void
  basePath?: string // Allow customizing the base path for URL updates
}

export interface FilterState {
  status: string[]
  priority: string[]
  assigneeId: string[]
  epicId: string[]
  sprintId: string[]
  showArchived: boolean
  overdue: boolean
}

const STATUS_OPTIONS = [
  { value: "PICKED", label: "Picked", color: "bg-blue-500" },
  { value: "TODO", label: "To Do", color: "bg-gray-500" },
  { value: "IN_DEV", label: "In Development", color: "bg-yellow-500" },
  { value: "WITH_QA", label: "With QA", color: "bg-orange-500" },
  { value: "READY", label: "Ready", color: "bg-green-500" },
  { value: "AWAITING_INPUTS", label: "Awaiting Inputs", color: "bg-red-500" },
  { value: "RELEASED", label: "Released", color: "bg-purple-500" },
]

const PRIORITY_OPTIONS = [
  { value: "HIGH", label: "High", color: "bg-red-500" },
  { value: "MEDIUM", label: "Medium", color: "bg-yellow-500" },
  { value: "LOW", label: "Low", color: "bg-green-500" },
]

export function TaskFilters({ onFiltersChange, hasActiveFilters, onClearFilters, basePath = '/tasks' }: TaskFiltersProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [epics, setEpics] = useState<Epic[]>([])
  const [sprints, setSprints] = useState<Sprint[]>([])
  const isInitializedRef = useRef(false)
  
  // Initialize filter state from URL parameters
  const [filters, setFilters] = useState<FilterState>(() => ({
    status: searchParams?.get('status')?.split(',').filter(Boolean) || [],
    priority: searchParams?.get('priority')?.split(',').filter(Boolean) || [],
    assigneeId: searchParams?.get('assigneeId')?.split(',').filter(Boolean) || [],
    epicId: searchParams?.get('epicId')?.split(',').filter(Boolean) || [],
    sprintId: searchParams?.get('sprintId')?.split(',').filter(Boolean) || [],
    showArchived: searchParams?.get('showArchived') === 'true',
    overdue: searchParams?.get('filter') === 'overdue',
  }))  // Load filter data when component mounts
  useEffect(() => {
    loadFilterData()
    // Notify parent of initial filters from URL only on mount
    if (!isInitializedRef.current) {
      onFiltersChange(filters)
      isInitializedRef.current = true
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Sync URL when searchParams change (for browser back/forward)
  useEffect(() => {
    const urlFilters = {
      status: searchParams?.get('status')?.split(',').filter(Boolean) || [],
      priority: searchParams?.get('priority')?.split(',').filter(Boolean) || [],
      assigneeId: searchParams?.get('assigneeId')?.split(',').filter(Boolean) || [],
      epicId: searchParams?.get('epicId')?.split(',').filter(Boolean) || [],
      sprintId: searchParams?.get('sprintId')?.split(',').filter(Boolean) || [],
      showArchived: searchParams?.get('showArchived') === 'true',
      overdue: searchParams?.get('filter') === 'overdue',
    }
    setFilters(urlFilters)
  }, [searchParams])
  // Update URL when filters change
  useEffect(() => {
    // Skip if not initialized yet (handled in mount effect)
    if (!isInitializedRef.current) {
      return
    }
    
    const params = new URLSearchParams()
    
    if (filters.status.length > 0) {
      params.set('status', filters.status.join(','))
    }
    if (filters.priority.length > 0) {
      params.set('priority', filters.priority.join(','))
    }
    if (filters.assigneeId.length > 0) {
      params.set('assigneeId', filters.assigneeId.join(','))
    }
    if (filters.epicId.length > 0) {
      params.set('epicId', filters.epicId.join(','))
    }
    if (filters.sprintId.length > 0) {
      params.set('sprintId', filters.sprintId.join(','))
    }
    if (filters.showArchived) {
      params.set('showArchived', 'true')
    }
    if (filters.overdue) {
      params.set('filter', 'overdue')
    }    const queryString = params.toString()
    const newUrl = queryString ? `${basePath}?${queryString}` : basePath
    
    // Only update URL if it's different to avoid unnecessary navigation
    if (window.location.pathname + window.location.search !== newUrl) {
      router.push(newUrl, { scroll: false })
    }

    onFiltersChange(filters)
  }, [filters, router, basePath, onFiltersChange])

  const loadFilterData = async () => {
    try {
      const [usersRes, epicsRes, sprintsRes] = await Promise.all([
        fetch('/api/user/list'),
        fetch('/api/epics'),
        fetch('/api/sprints'),
      ])

      if (usersRes.ok) {
        const usersData = await usersRes.json()
        setUsers(usersData.users || [])
      }

      if (epicsRes.ok) {
        const epicsData = await epicsRes.json()
        setEpics(epicsData.epics || [])
      }

      if (sprintsRes.ok) {
        const sprintsData = await sprintsRes.json()
        setSprints(sprintsData.sprints || [])
      }
    } catch (error) {
      console.error('Failed to load filter data:', error)
    }
  }

  const updateFilter = <K extends keyof FilterState>(
    key: K,
    value: FilterState[K]
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const toggleArrayFilter = <K extends keyof Pick<FilterState, 'status' | 'priority' | 'assigneeId' | 'epicId' | 'sprintId'>>(
    key: K,
    value: string
  ) => {
    setFilters(prev => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter(item => item !== value)
        : [...prev[key], value]
    }))
  }

  const clearAllFilters = () => {
    setFilters({
      status: [],
      priority: [],
      assigneeId: [],
      epicId: [],
      sprintId: [],
      showArchived: false,
      overdue: false,
    })
    onClearFilters()
  }

  const getActiveFilterCount = () => {
    return (
      filters.status.length +
      filters.priority.length +
      filters.assigneeId.length +
      filters.epicId.length +
      filters.sprintId.length +
      (filters.showArchived ? 1 : 0) +
      (filters.overdue ? 1 : 0)
    )
  }

  const getFilterBadges = () => {
    const badges = []

    // Status badges
    filters.status.forEach(status => {
      const statusOption = STATUS_OPTIONS.find(opt => opt.value === status)
      if (statusOption) {
        badges.push(
          <Badge key={`status-${status}`} variant="secondary" className="text-xs">
            {statusOption.label}
            <button
              onClick={() => toggleArrayFilter('status', status)}
              className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        )
      }
    })

    // Priority badges
    filters.priority.forEach(priority => {
      const priorityOption = PRIORITY_OPTIONS.find(opt => opt.value === priority)
      if (priorityOption) {
        badges.push(
          <Badge key={`priority-${priority}`} variant="secondary" className="text-xs">
            {priorityOption.label}
            <button
              onClick={() => toggleArrayFilter('priority', priority)}
              className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        )
      }
    })

    // Assignee badges
    filters.assigneeId.forEach(assigneeId => {
      const user = users.find(u => u.id === assigneeId)
      if (user) {
        badges.push(
          <Badge key={`assignee-${assigneeId}`} variant="secondary" className="text-xs">
            {user.name || user.email}
            <button
              onClick={() => toggleArrayFilter('assigneeId', assigneeId)}
              className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        )
      }
    })

    // Epic badges
    filters.epicId.forEach(epicId => {
      const epic = epics.find(e => e.id === epicId)
      if (epic) {
        badges.push(
          <Badge key={`epic-${epicId}`} variant="secondary" className="text-xs">
            {epic.title}
            <button
              onClick={() => toggleArrayFilter('epicId', epicId)}
              className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        )
      }
    })

    // Sprint badges
    filters.sprintId.forEach(sprintId => {
      const sprint = sprints.find(s => s.id === sprintId)
      if (sprint) {
        badges.push(
          <Badge key={`sprint-${sprintId}`} variant="secondary" className="text-xs">
            {sprint.name}
            <button
              onClick={() => toggleArrayFilter('sprintId', sprintId)}
              className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        )
      }
    })

    // Special filters
    if (filters.showArchived) {
      badges.push(
        <Badge key="archived" variant="secondary" className="text-xs">
          Show Archived
          <button
            onClick={() => updateFilter('showArchived', false)}
            className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      )
    }

    if (filters.overdue) {
      badges.push(
        <Badge key="overdue" variant="destructive" className="text-xs">
          Overdue
          <button
            onClick={() => updateFilter('overdue', false)}
            className="ml-1 hover:bg-gray-100 rounded-full p-0.5"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      )
    }

    return badges
  }

  return (
    <div className="flex items-center gap-2">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="relative">
            <Filter className="mr-2 h-4 w-4" />
            Filter
            {getActiveFilterCount() > 0 && (
              <Badge className="ml-2 px-1.5 py-0.5 text-xs min-w-[1.25rem] h-5">
                {getActiveFilterCount()}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="start">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Filter Tasks</h4>
              {getActiveFilterCount() > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="text-xs"
                >
                  Clear All
                </Button>
              )}
            </div>

            <ScrollArea className="h-96">
              <div className="space-y-4">
                {/* Status Filter */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Flag className="h-4 w-4" />
                    <label className="text-sm font-medium">Status</label>
                  </div>
                  <div className="space-y-2">
                    {STATUS_OPTIONS.map(option => (
                      <div key={option.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`status-${option.value}`}
                          checked={filters.status.includes(option.value)}
                          onCheckedChange={() => toggleArrayFilter('status', option.value)}
                        />
                        <label
                          htmlFor={`status-${option.value}`}
                          className="text-sm flex items-center gap-2 cursor-pointer"
                        >
                          <div className={`w-2 h-2 rounded-full ${option.color}`} />
                          {option.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Priority Filter */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-4 w-4" />
                    <label className="text-sm font-medium">Priority</label>
                  </div>
                  <div className="space-y-2">
                    {PRIORITY_OPTIONS.map(option => (
                      <div key={option.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`priority-${option.value}`}
                          checked={filters.priority.includes(option.value)}
                          onCheckedChange={() => toggleArrayFilter('priority', option.value)}
                        />
                        <label
                          htmlFor={`priority-${option.value}`}
                          className="text-sm flex items-center gap-2 cursor-pointer"
                        >
                          <div className={`w-2 h-2 rounded-full ${option.color}`} />
                          {option.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Assignee Filter */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <User className="h-4 w-4" />
                    <label className="text-sm font-medium">Assignee</label>
                  </div>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {users.map(user => (
                      <div key={user.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`assignee-${user.id}`}
                          checked={filters.assigneeId.includes(user.id)}
                          onCheckedChange={() => toggleArrayFilter('assigneeId', user.id)}
                        />
                        <label
                          htmlFor={`assignee-${user.id}`}
                          className="text-sm cursor-pointer"
                        >
                          {user.name || user.email}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Epic Filter */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Layers className="h-4 w-4" />
                    <label className="text-sm font-medium">Epic</label>
                  </div>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {epics.map(epic => (
                      <div key={epic.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`epic-${epic.id}`}
                          checked={filters.epicId.includes(epic.id)}
                          onCheckedChange={() => toggleArrayFilter('epicId', epic.id)}
                        />
                        <label
                          htmlFor={`epic-${epic.id}`}
                          className="text-sm cursor-pointer"
                        >
                          {epic.title}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Sprint Filter */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4" />
                    <label className="text-sm font-medium">Sprint</label>
                  </div>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {sprints.map(sprint => (
                      <div key={sprint.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`sprint-${sprint.id}`}
                          checked={filters.sprintId.includes(sprint.id)}
                          onCheckedChange={() => toggleArrayFilter('sprintId', sprint.id)}
                        />
                        <label
                          htmlFor={`sprint-${sprint.id}`}
                          className="text-sm cursor-pointer flex items-center gap-2"
                        >
                          {sprint.name}
                          {sprint.isActive && (
                            <Badge variant="secondary" className="text-xs">Active</Badge>
                          )}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Special Filters */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="show-archived"
                      checked={filters.showArchived}
                      onCheckedChange={(checked) => updateFilter('showArchived', !!checked)}
                    />
                    <label htmlFor="show-archived" className="text-sm cursor-pointer">
                      Show Archived Tasks
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="overdue"
                      checked={filters.overdue}
                      onCheckedChange={(checked) => updateFilter('overdue', !!checked)}
                    />
                    <label htmlFor="overdue" className="text-sm cursor-pointer">
                      Show Only Overdue Tasks
                    </label>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </div>
        </PopoverContent>
      </Popover>

      {/* Active Filter Badges */}
      {getActiveFilterCount() > 0 && (
        <div className="flex items-center gap-1 flex-wrap">
          {getFilterBadges()}
        </div>
      )}

      {/* Clear All Filters Button */}
      {hasActiveFilters && (
        <Button variant="outline" size="sm" onClick={clearAllFilters}>
          Clear All Filters
        </Button>
      )}
    </div>
  )
}

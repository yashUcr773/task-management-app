"use client"

import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, ArrowUpDown } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

// Mock data - same as Kanban board
const mockTasks = [
  {
    id: "1",
    title: "Implement user authentication",
    description: "Set up NextAuth.js with Prisma adapter",
    status: "TODO",
    priority: "HIGH" as const,
    storyPoints: 8,
    dueDate: new Date("2025-06-01"),
    assignee: { name: "John Doe", email: "john@example.com", image: null },
    tags: [{ name: "Backend", color: "#3B82F6" }, { name: "Security", color: "#EF4444" }],
    createdAt: new Date("2025-05-20")
  },
  {
    id: "2", 
    title: "Design landing page",
    description: "Create responsive landing page with hero section",
    status: "IN_DEV",
    priority: "MEDIUM" as const,
    storyPoints: 5,
    dueDate: new Date("2025-05-30"),
    assignee: { name: "Jane Smith", email: "jane@example.com", image: null },
    tags: [{ name: "Frontend", color: "#10B981" }, { name: "Design", color: "#8B5CF6" }],
    createdAt: new Date("2025-05-18")
  },
  {
    id: "3",
    title: "Update API documentation", 
    description: "Document all REST endpoints with examples",
    status: "WITH_QA",
    priority: "LOW" as const,
    storyPoints: 3,
    dueDate: new Date("2025-06-03"),
    assignee: { name: "Mike Johnson", email: "mike@example.com", image: null },
    tags: [{ name: "Documentation", color: "#F59E0B" }],
    createdAt: new Date("2025-05-15")
  },
  {
    id: "4",
    title: "Setup CI/CD pipeline",
    description: "Configure GitHub Actions for automated testing and deployment",
    status: "READY",
    priority: "HIGH" as const,
    storyPoints: 13,
    dueDate: new Date("2025-06-05"),
    assignee: { name: "Sarah Wilson", email: "sarah@example.com", image: null },
    tags: [{ name: "DevOps", color: "#06B6D4" }],
    createdAt: new Date("2025-05-22")
  }
]

interface TasksTableProps {
  searchQuery: string
}

export function TasksTable({ searchQuery }: TasksTableProps) {
  const [tasks, setTasks] = useState(mockTasks)
  const [selectedTasks, setSelectedTasks] = useState<string[]>([])
  const [sortField, setSortField] = useState<string>("")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")

  const filteredTasks = tasks.filter(task => 
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.assignee?.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return "destructive"
      case "MEDIUM":
        return "default"
      case "LOW":
        return "secondary"
      default:
        return "secondary"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "TODO":
        return "secondary"
      case "IN_DEV":
        return "default"
      case "WITH_QA":
        return "outline"
      case "READY":
        return "default"
      default:
        return "secondary"
    }
  }

  const handleSelectTask = (taskId: string) => {
    setSelectedTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    )
  }

  const handleSelectAll = () => {
    setSelectedTasks(
      selectedTasks.length === filteredTasks.length 
        ? [] 
        : filteredTasks.map(task => task.id)
    )
  }

  return (
    <div className="space-y-4">
      {selectedTasks.length > 0 && (
        <div className="flex items-center space-x-2 p-2 bg-muted rounded-md">
          <span className="text-sm text-muted-foreground">
            {selectedTasks.length} task(s) selected
          </span>
          <Button variant="outline" size="sm">
            Bulk Edit
          </Button>
          <Button variant="outline" size="sm">
            Delete
          </Button>
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedTasks.length === filteredTasks.length && filteredTasks.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>
                <Button 
                  variant="ghost" 
                  onClick={() => handleSort("title")}
                  className="h-auto p-0 font-medium"
                >
                  Title
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Assignee</TableHead>
              <TableHead>
                <Button 
                  variant="ghost" 
                  onClick={() => handleSort("dueDate")}
                  className="h-auto p-0 font-medium"
                >
                  Due Date
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>Story Points</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTasks.map((task) => (
              <TableRow key={task.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedTasks.includes(task.id)}
                    onCheckedChange={() => handleSelectTask(task.id)}
                  />
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="font-medium">{task.title}</div>
                    {task.description && (
                      <div className="text-sm text-muted-foreground line-clamp-1">
                        {task.description}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusColor(task.status)}>
                    {task.status.replace("_", " ")}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={getPriorityColor(task.priority)}>
                    {task.priority}
                  </Badge>
                </TableCell>
                <TableCell>
                  {task.assignee && (
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={task.assignee.image || ""} />
                        <AvatarFallback className="text-xs">
                          {task.assignee.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{task.assignee.name}</span>
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  {task.dueDate && (
                    <div className="text-sm">
                      {formatDistanceToNow(task.dueDate, { addSuffix: true })}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  {task.storyPoints && (
                    <Badge variant="outline">{task.storyPoints}</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {task.tags?.slice(0, 2).map((tag, index) => (
                      <Badge 
                        key={index} 
                        variant="outline" 
                        className="text-xs"
                        style={{ borderColor: tag.color, color: tag.color }}
                      >
                        {tag.name}
                      </Badge>
                    ))}
                    {task.tags && task.tags.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{task.tags.length - 2}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Edit</DropdownMenuItem>
                      <DropdownMenuItem>Duplicate</DropdownMenuItem>
                      <DropdownMenuItem>Archive</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

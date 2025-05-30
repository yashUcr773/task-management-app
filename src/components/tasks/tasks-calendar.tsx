'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date;
  assignedTo?: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
  labels?: string[];
}

interface TasksCalendarProps {
  tasks?: any[];
  isLoading?: boolean;
}

const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Design System Updates',
    description: 'Update the design system components',
    status: 'in_progress',
    priority: 'high',
    dueDate: new Date(2024, 11, 15),
    assignedTo: {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
    },
    labels: ['Design', 'UI/UX'],
  },
  {
    id: '2',
    title: 'API Integration',
    status: 'todo',
    priority: 'medium',
    dueDate: new Date(2024, 11, 20),
    assignedTo: {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
    },
    labels: ['Backend', 'API'],
  },
  {
    id: '3',
    title: 'User Testing',
    status: 'review',
    priority: 'low',
    dueDate: new Date(2024, 11, 25),
    assignedTo: {
      id: '3',
      name: 'Bob Johnson',
      email: 'bob@example.com',
    },
    labels: ['Testing', 'UX'],
  },
];

const priorityColors = {
  low: 'bg-green-100 text-green-800 border-green-300',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  high: 'bg-red-100 text-red-800 border-red-300',
};

const statusColors = {
  todo: 'bg-gray-100 text-gray-800 border-gray-300',
  in_progress: 'bg-blue-100 text-blue-800 border-blue-300',
  review: 'bg-purple-100 text-purple-800 border-purple-300',
  done: 'bg-green-100 text-green-800 border-green-300',
};

export default function TasksCalendar({ 
  tasks: externalTasks, 
  isLoading = false 
}: TasksCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [tasks, setTasks] = useState<Task[]>(mockTasks);

  // Sync external tasks with local state
  useEffect(() => {
    if (externalTasks) {
      setTasks(externalTasks);
    }
  }, [externalTasks]);

  const getTasksForDate = (date: Date) => {
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      return (
        task.dueDate.getDate() === date.getDate() &&
        task.dueDate.getMonth() === date.getMonth() &&
        task.dueDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const selectedDateTasks = selectedDate ? getTasksForDate(selectedDate) : [];

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      if (direction === 'prev') {
        newMonth.setMonth(newMonth.getMonth() - 1);
      } else {
        newMonth.setMonth(newMonth.getMonth() + 1);
      }
      return newMonth;
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-9 w-9" />
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-9 w-9" />
          </div>
          <Skeleton className="h-10 w-24" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar Skeleton */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Calendar header */}
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-6 w-32" />
                    <div className="flex space-x-2">
                      <Skeleton className="h-8 w-8" />
                      <Skeleton className="h-8 w-8" />
                    </div>
                  </div>
                  
                  {/* Calendar grid */}
                  <div className="grid grid-cols-7 gap-2">
                    {/* Day headers */}
                    {Array.from({ length: 7 }).map((_, i) => (
                      <Skeleton key={i} className="h-8 w-full" />
                    ))}
                    
                    {/* Calendar days */}
                    {Array.from({ length: 35 }).map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Task Details Skeleton */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-5 w-16" />
                      </div>
                      <Skeleton className="h-4 w-full" />
                      <div className="flex items-center justify-between">
                        <Skeleton className="h-5 w-20" />
                        <div className="flex items-center space-x-2">
                          <Skeleton className="h-6 w-6 rounded-full" />
                          <Skeleton className="h-4 w-16" />
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Skeleton className="h-5 w-12" />
                        <Skeleton className="h-5 w-16" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateMonth('prev')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-2xl font-semibold">
            {currentMonth.toLocaleDateString('en-US', { 
              month: 'long', 
              year: 'numeric' 
            })}
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateMonth('next')}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-6">              <div className="w-full p-4">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">
                      {currentMonth.toLocaleDateString('en-US', { 
                        month: 'long', 
                        year: 'numeric' 
                      })}
                    </h3>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigateMonth('prev')}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigateMonth('next')}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Simple calendar grid */}
                  <div className="grid grid-cols-7 gap-2">
                    {/* Day headers */}
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                      <div key={day} className="text-center text-sm font-medium text-gray-500 p-2">
                        {day}
                      </div>
                    ))}
                    
                    {/* Calendar days - simplified */}
                    {Array.from({ length: 30 }).map((_, index) => {
                      const day = index + 1;
                      const currentDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                      const dayTasks = getTasksForDate(currentDate);
                      const isSelected = selectedDate && selectedDate.getDate() === day;
                      
                      return (
                        <button
                          key={index}
                          onClick={() => setSelectedDate(currentDate)}
                          className={`p-2 text-sm border rounded min-h-[60px] relative ${
                            isSelected ? 'bg-blue-100 border-blue-500' : 'hover:bg-gray-50'
                          }`}
                        >
                          <div className="text-center">{day}</div>
                          {dayTasks.length > 0 && (
                            <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
                              <div className="flex space-x-1">
                                {dayTasks.slice(0, 3).map((task) => (
                                  <div
                                    key={task.id}
                                    className={`w-2 h-2 rounded-full ${
                                      task.priority === 'high' ? 'bg-red-500' :
                                      task.priority === 'medium' ? 'bg-yellow-500' :
                                      'bg-green-500'
                                    }`}
                                  />
                                ))}
                                {dayTasks.length > 3 && (
                                  <div className="text-xs text-gray-500">
                                    +{dayTasks.length - 3}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Task Details */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedDate 
                  ? `Tasks for ${selectedDate.toLocaleDateString()}`
                  : 'Select a date'
                }
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedDateTasks.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No tasks scheduled for this date
                </p>
              ) : (
                <div className="space-y-4">
                  {selectedDateTasks.map((task) => (
                    <div key={task.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <h3 className="font-medium">{task.title}</h3>
                        <Badge
                          variant="outline"
                          className={priorityColors[task.priority]}
                        >
                          {task.priority}
                        </Badge>
                      </div>

                      {task.description && (
                        <p className="text-sm text-gray-600">{task.description}</p>
                      )}

                      <div className="flex items-center justify-between">
                        <Badge
                          variant="outline"
                          className={statusColors[task.status]}
                        >
                          {task.status.replace('_', ' ')}
                        </Badge>

                        {task.assignedTo && (
                          <div className="flex items-center space-x-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={task.assignedTo.image} />
                              <AvatarFallback>
                                {task.assignedTo.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm text-gray-600">
                              {task.assignedTo.name}
                            </span>
                          </div>
                        )}
                      </div>

                      {task.labels && task.labels.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {task.labels.map((label, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="text-xs"
                            >
                              {label}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

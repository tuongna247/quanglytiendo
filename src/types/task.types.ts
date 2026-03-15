export type TaskStatus = 'todo' | 'in_progress' | 'done' | 'cancelled'
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'

export interface TaskStep {
  id: string
  order: number
  title: string
  description?: string
  isDone: boolean
  completedAt?: string
}

export interface Task {
  id: string
  userId: string
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  category: string
  dueDate?: string
  scheduledDate?: string
  estimatedMinutes?: number
  steps: TaskStep[]
  tags: string[]
  linkedEventId?: string
  createdAt: string
  updatedAt: string
}

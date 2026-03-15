export interface PlannerItem {
  id: string
  userId: string
  date: string
  order: number
  title: string
  notes?: string
  isDone: boolean
  completedAt?: string
  estimatedMinutes?: number
  linkedTaskId?: string
  linkedEventId?: string
  priority: 'low' | 'medium' | 'high'
  createdAt: string
  updatedAt: string
}

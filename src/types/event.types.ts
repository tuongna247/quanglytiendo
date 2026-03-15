export type RecurrenceRule = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly'

export interface CalendarEvent {
  id: string
  userId: string
  title: string
  description?: string
  startAt: string
  endAt: string
  allDay: boolean
  color: string
  category: string
  recurrence: RecurrenceRule
  recurrenceEndDate?: string
  reminderMinutes?: number
  linkedTaskId?: string
  createdAt: string
  updatedAt: string
}

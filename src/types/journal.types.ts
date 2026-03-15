export interface NoteTodo {
  id: string
  text: string
  isDone: boolean
  completedAt?: string
}

export interface DailyNote {
  id: string
  userId: string
  date: string
  content: string
  todoItems: NoteTodo[]
  createdAt: string
  updatedAt: string
}

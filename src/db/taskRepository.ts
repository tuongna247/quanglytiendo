import { db } from './database'
import type { Task } from '@/types/task.types'

export const taskRepository = {
  getByUser: (userId: string) =>
    db.tasks.where('userId').equals(userId).toArray(),
  getById: (id: string) => db.tasks.get(id),
  create: (task: Task) => db.tasks.add(task),
  update: (id: string, changes: Partial<Task>) => db.tasks.update(id, changes),
  delete: (id: string) => db.tasks.delete(id),
}

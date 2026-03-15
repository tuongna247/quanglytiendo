import { db } from './database'
import type { User } from '@/types/auth.types'

export const userRepository = {
  getAll: () => db.users.toArray(),
  getById: (id: string) => db.users.get(id),
  getByUsername: (username: string) => db.users.where('username').equals(username).first(),
  create: (user: User) => db.users.add(user),
  update: (id: string, changes: Partial<User>) => db.users.update(id, changes),
  delete: (id: string) => db.users.delete(id),
}

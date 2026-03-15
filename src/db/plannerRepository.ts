import { db } from './database'
import type { PlannerItem } from '@/types/planner.types'

export const plannerRepository = {
  getByDate: (userId: string, date: string) =>
    db.plannerItems.where('userId').equals(userId).filter(p => p.date === date)
      .sortBy('order'),
  getById: (id: string) => db.plannerItems.get(id),
  create: (item: PlannerItem) => db.plannerItems.add(item),
  update: (id: string, changes: Partial<PlannerItem>) => db.plannerItems.update(id, changes),
  delete: (id: string) => db.plannerItems.delete(id),
}

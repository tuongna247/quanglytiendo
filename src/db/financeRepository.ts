import { db } from './database'
import type { Transaction } from '@/types/finance.types'

export const financeRepository = {
  getByUser: (userId: string) =>
    db.transactions.where('userId').equals(userId).toArray(),
  getByDateRange: (userId: string, from: string, to: string) =>
    db.transactions.where('userId').equals(userId).filter(
      t => t.date >= from && t.date <= to
    ).toArray(),
  getById: (id: string) => db.transactions.get(id),
  create: (t: Transaction) => db.transactions.add(t),
  update: (id: string, changes: Partial<Transaction>) => db.transactions.update(id, changes),
  delete: (id: string) => db.transactions.delete(id),
}

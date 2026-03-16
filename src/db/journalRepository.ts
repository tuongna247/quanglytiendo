import { db } from './database'
import type { DailyNote } from '@/types/journal.types'

export const journalRepository = {
  getByDate: (userId: string, date: string) =>
    db.dailyNotes.where('userId').equals(userId).filter(n => n.date === date).first(),
  getByUser: (userId: string) =>
    db.dailyNotes.where('userId').equals(userId).sortBy('date'),
  upsert: async (note: DailyNote) => {
    const existing = await journalRepository.getByDate(note.userId, note.date)
    if (existing) { const { id: _id, ...changes } = note; return db.dailyNotes.update(existing.id, changes) }
    return db.dailyNotes.add(note)
  },
  delete: (id: string) => db.dailyNotes.delete(id),
}

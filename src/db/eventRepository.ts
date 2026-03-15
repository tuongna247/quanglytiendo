import { db } from './database'
import type { CalendarEvent } from '@/types/event.types'

export const eventRepository = {
  getByUser: (userId: string) =>
    db.events.where('userId').equals(userId).toArray(),
  getByDateRange: (userId: string, from: string, to: string) =>
    db.events.where('userId').equals(userId).filter(
      e => e.startAt >= from && e.startAt <= to
    ).toArray(),
  getById: (id: string) => db.events.get(id),
  create: (event: CalendarEvent) => db.events.add(event),
  update: (id: string, changes: Partial<CalendarEvent>) => db.events.update(id, changes),
  delete: (id: string) => db.events.delete(id),
}

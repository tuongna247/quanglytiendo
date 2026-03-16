import Dexie, { type EntityTable } from 'dexie'
import type { User } from '@/types/auth.types'
import type { CalendarEvent } from '@/types/event.types'
import type { Task } from '@/types/task.types'
import type { Transaction } from '@/types/finance.types'
import type { PlannerItem } from '@/types/planner.types'
import type { WeightLog, ExerciseSession, HealthGoal, BodyCheckIn } from '@/types/health.types'
import type { DailyNote } from '@/types/journal.types'
import type { DailyDevotion, BibleReadingPlan, BibleReadingDay } from '@/types/devotion.types'
import type { EbookBook, EbookHighlight, EbookComment, EbookBookmark, EbookProgress } from '@/types/ebook.types'

export const db = new Dexie('AppQuanLyTienDo') as Dexie & {
  users: EntityTable<User, 'id'>
  events: EntityTable<CalendarEvent, 'id'>
  tasks: EntityTable<Task, 'id'>
  transactions: EntityTable<Transaction, 'id'>
  plannerItems: EntityTable<PlannerItem, 'id'>
  weightLogs: EntityTable<WeightLog, 'id'>
  exerciseSessions: EntityTable<ExerciseSession, 'id'>
  healthGoals: EntityTable<HealthGoal, 'id'>
  bodyCheckIns: EntityTable<BodyCheckIn, 'id'>
  dailyNotes: EntityTable<DailyNote, 'id'>
  dailyDevotions: EntityTable<DailyDevotion, 'id'>
  bibleReadingPlans: EntityTable<BibleReadingPlan, 'id'>
  bibleReadingDays: EntityTable<BibleReadingDay, 'id'>
  ebookBooks: EntityTable<EbookBook, 'id'>
  ebookHighlights: EntityTable<EbookHighlight, 'id'>
  ebookComments: EntityTable<EbookComment, 'id'>
  ebookBookmarks: EntityTable<EbookBookmark, 'id'>
  ebookProgress: EntityTable<EbookProgress, 'id'>
}

db.version(1).stores({
  users:            '&id, &username',
  events:           '&id, userId, startAt, endAt, category',
  tasks:            '&id, userId, status, priority, dueDate, scheduledDate',
  transactions:     '&id, userId, type, date, category',
  plannerItems:     '&id, userId, date, order, isDone',
  weightLogs:       '&id, userId, date',
  exerciseSessions: '&id, userId, date, type',
  healthGoals:      '&id, userId, isActive',
  bodyCheckIns:     '&id, userId, date',
  dailyNotes:       '&id, userId, date',
  dailyDevotions:   '&id, userId, date',
  bibleReadingPlans: '&id, userId',
  bibleReadingDays: '&id, planId, userId, dayNumber, scheduledDate, isCompleted',
})

db.version(2).stores({
  ebookBooks:      '&id, userId, uploadedAt',
  ebookHighlights: '&id, userId, bookId, pageNumber',
  ebookComments:   '&id, userId, bookId, pageNumber',
  ebookBookmarks:  '&id, userId, bookId, pageNumber',
  ebookProgress:   '&id, userId, bookId',
})

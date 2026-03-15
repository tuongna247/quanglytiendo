import { db } from './database'
import type { DailyDevotion, BibleReadingPlan, BibleReadingDay } from '@/types/devotion.types'

export const devotionRepository = {
  getByDate: (userId: string, date: string) =>
    db.dailyDevotions.where('userId').equals(userId).filter(d => d.date === date).first(),
  getByUser: (userId: string) =>
    db.dailyDevotions.where('userId').equals(userId).sortBy('date'),
  create: (d: DailyDevotion) => db.dailyDevotions.add(d),
  update: (id: string, changes: Partial<DailyDevotion>) => db.dailyDevotions.update(id, changes),
  delete: (id: string) => db.dailyDevotions.delete(id),
}

export const bibleReadingPlanRepository = {
  getActive: (userId: string) =>
    db.bibleReadingPlans.where('userId').equals(userId).first(),
  createPlan: (plan: BibleReadingPlan) => db.bibleReadingPlans.add(plan),
  getDays: (planId: string) =>
    db.bibleReadingDays.where('planId').equals(planId).sortBy('dayNumber'),
  getDayByDate: (userId: string, date: string) =>
    db.bibleReadingDays.where('userId').equals(userId).filter(d => d.scheduledDate === date).first(),
  bulkCreateDays: (days: BibleReadingDay[]) => db.bibleReadingDays.bulkAdd(days),
  updateDay: (id: string, changes: Partial<BibleReadingDay>) => db.bibleReadingDays.update(id, changes),
  deleteAll: async (userId: string) => {
    const plan = await bibleReadingPlanRepository.getActive(userId)
    if (plan) {
      await db.bibleReadingDays.where('planId').equals(plan.id).delete()
      await db.bibleReadingPlans.delete(plan.id)
    }
  },
}

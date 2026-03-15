import { db } from './database'
import type { WeightLog, ExerciseSession, HealthGoal, BodyCheckIn } from '@/types/health.types'

export const weightRepository = {
  getByUser: (userId: string) =>
    db.weightLogs.where('userId').equals(userId).sortBy('date'),
  create: (log: WeightLog) => db.weightLogs.add(log),
  update: (id: string, changes: Partial<WeightLog>) => db.weightLogs.update(id, changes),
  delete: (id: string) => db.weightLogs.delete(id),
}

export const exerciseRepository = {
  getByUser: (userId: string) =>
    db.exerciseSessions.where('userId').equals(userId).sortBy('date'),
  getByDate: (userId: string, date: string) =>
    db.exerciseSessions.where('userId').equals(userId).filter(e => e.date === date).toArray(),
  create: (s: ExerciseSession) => db.exerciseSessions.add(s),
  update: (id: string, changes: Partial<ExerciseSession>) => db.exerciseSessions.update(id, changes),
  delete: (id: string) => db.exerciseSessions.delete(id),
}

export const healthGoalRepository = {
  getActive: (userId: string) =>
    db.healthGoals.where('userId').equals(userId).filter(g => g.isActive).first(),
  create: (goal: HealthGoal) => db.healthGoals.add(goal),
  update: (id: string, changes: Partial<HealthGoal>) => db.healthGoals.update(id, changes),
}

export const bodyCheckInRepository = {
  getByDate: (userId: string, date: string) =>
    db.bodyCheckIns.where('userId').equals(userId).filter(c => c.date === date).first(),
  getByUser: (userId: string) =>
    db.bodyCheckIns.where('userId').equals(userId).sortBy('date'),
  create: (checkIn: BodyCheckIn) => db.bodyCheckIns.add(checkIn),
  update: (id: string, changes: Partial<BodyCheckIn>) => db.bodyCheckIns.update(id, changes),
  delete: (id: string) => db.bodyCheckIns.delete(id),
}

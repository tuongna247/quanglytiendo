import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  weightRepository,
  exerciseRepository,
  healthGoalRepository,
  bodyCheckInRepository,
} from '@/db/healthRepository'
import { useCurrentUserId } from '@/store/useAuthStore'
import type { WeightLog, ExerciseSession, HealthGoal, BodyCheckIn } from '@/types/health.types'

// Weight
export function useWeightLogs() {
  const userId = useCurrentUserId()
  return useQuery({
    queryKey: ['weight', userId],
    queryFn: () => weightRepository.getByUser(userId),
    enabled: !!userId,
  })
}

export function useCreateWeight() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (log: WeightLog) => weightRepository.create(log),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['weight'] }),
  })
}

export function useUpdateWeight() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, changes }: { id: string; changes: Partial<WeightLog> }) =>
      weightRepository.update(id, changes),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['weight'] }),
  })
}

export function useDeleteWeight() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => weightRepository.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['weight'] }),
  })
}

// Exercise
export function useExerciseSessions() {
  const userId = useCurrentUserId()
  return useQuery({
    queryKey: ['exercise', userId],
    queryFn: () => exerciseRepository.getByUser(userId),
    enabled: !!userId,
  })
}

export function useCreateExercise() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (session: ExerciseSession) => exerciseRepository.create(session),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['exercise'] }),
  })
}

export function useUpdateExercise() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, changes }: { id: string; changes: Partial<ExerciseSession> }) =>
      exerciseRepository.update(id, changes),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['exercise'] }),
  })
}

export function useDeleteExercise() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => exerciseRepository.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['exercise'] }),
  })
}

// Health Goal
export function useHealthGoal() {
  const userId = useCurrentUserId()
  return useQuery({
    queryKey: ['healthGoal', userId],
    queryFn: () => healthGoalRepository.getActive(userId),
    enabled: !!userId,
  })
}

export function useSaveHealthGoal() {
  const qc = useQueryClient()
  const userId = useCurrentUserId()
  return useMutation({
    mutationFn: async (goal: HealthGoal) => {
      const existing = await healthGoalRepository.getActive(userId)
      if (existing) {
        return healthGoalRepository.update(existing.id, goal)
      }
      return healthGoalRepository.create(goal)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['healthGoal'] }),
  })
}

// Body Check-In
export function useBodyCheckIn(date: string) {
  const userId = useCurrentUserId()
  return useQuery({
    queryKey: ['bodyCheckIn', userId, date],
    queryFn: () => bodyCheckInRepository.getByDate(userId, date),
    enabled: !!userId && !!date,
  })
}

export function useSaveBodyCheckIn() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (checkIn: BodyCheckIn) => {
      const existing = await bodyCheckInRepository.getByDate(checkIn.userId, checkIn.date)
      if (existing) {
        return bodyCheckInRepository.update(existing.id, checkIn)
      }
      return bodyCheckInRepository.create(checkIn)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['bodyCheckIn'] }),
  })
}

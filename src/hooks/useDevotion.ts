import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { devotionRepository, bibleReadingPlanRepository } from '@/db/devotionRepository'
import { useCurrentUserId } from '@/store/useAuthStore'
import type { DailyDevotion } from '@/types/devotion.types'
import { todayStr } from '@/lib/utils'

export function useDevotion(date: string) {
  const userId = useCurrentUserId()
  return useQuery({
    queryKey: ['devotion', userId, date],
    queryFn: () => devotionRepository.getByDate(userId, date),
    enabled: !!userId && !!date,
  })
}

export function useSaveDevotion() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (devotion: DailyDevotion) => {
      const existing = await devotionRepository.getByDate(devotion.userId, devotion.date)
      if (existing) {
        return devotionRepository.update(existing.id, devotion)
      }
      return devotionRepository.create(devotion)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['devotion'] }),
  })
}

export function useBibleReadingPlans() {
  const userId = useCurrentUserId()
  return useQuery({
    queryKey: ['bibleReadingPlans', userId],
    queryFn: () => bibleReadingPlanRepository.getActive(userId),
    enabled: !!userId,
  })
}

export function useTodayBibleDay() {
  const userId = useCurrentUserId()
  const today = todayStr()
  return useQuery({
    queryKey: ['bibleReadingDay', userId, today],
    queryFn: () => bibleReadingPlanRepository.getDayByDate(userId, today),
    enabled: !!userId,
  })
}

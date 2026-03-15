import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { plannerRepository } from '@/db/plannerRepository'
import { useCurrentUserId } from '@/store/useAuthStore'
import type { PlannerItem } from '@/types/planner.types'

export function usePlannerItems(date: string) {
  const userId = useCurrentUserId()
  return useQuery({
    queryKey: ['planner', userId, date],
    queryFn: () => plannerRepository.getByDate(userId, date),
    enabled: !!userId,
  })
}

export function useCreatePlannerItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (item: PlannerItem) => plannerRepository.create(item),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['planner'] }),
  })
}

export function useUpdatePlannerItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, changes }: { id: string; changes: Partial<PlannerItem> }) =>
      plannerRepository.update(id, changes),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['planner'] }),
  })
}

export function useDeletePlannerItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => plannerRepository.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['planner'] }),
  })
}

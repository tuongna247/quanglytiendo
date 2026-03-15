import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { financeRepository } from '@/db/financeRepository'
import { useCurrentUserId } from '@/store/useAuthStore'
import type { Transaction, FinancePeriod } from '@/types/finance.types'
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, format } from 'date-fns'

function getPeriodRange(period: FinancePeriod): [string, string] {
  const now = new Date()
  const fmt = (d: Date) => format(d, 'yyyy-MM-dd')
  switch (period) {
    case 'day': return [fmt(startOfDay(now)), fmt(endOfDay(now))]
    case 'week': return [fmt(startOfWeek(now, { weekStartsOn: 1 })), fmt(endOfWeek(now, { weekStartsOn: 1 }))]
    case 'month': return [fmt(startOfMonth(now)), fmt(endOfMonth(now))]
    case 'year': return [fmt(startOfYear(now)), fmt(endOfYear(now))]
  }
}

export function useTransactions(period: FinancePeriod) {
  const userId = useCurrentUserId()
  const [from, to] = getPeriodRange(period)
  return useQuery({
    queryKey: ['transactions', userId, period],
    queryFn: () => financeRepository.getByDateRange(userId, from, to),
    enabled: !!userId,
  })
}

export function useCreateTransaction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (t: Transaction) => financeRepository.create(t),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['transactions'] }),
  })
}

export function useUpdateTransaction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, changes }: { id: string; changes: Partial<Transaction> }) =>
      financeRepository.update(id, changes),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['transactions'] }),
  })
}

export function useDeleteTransaction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => financeRepository.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['transactions'] }),
  })
}

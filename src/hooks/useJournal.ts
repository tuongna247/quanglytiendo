import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { journalRepository } from '@/db/journalRepository'
import { useCurrentUserId } from '@/store/useAuthStore'
import type { DailyNote } from '@/types/journal.types'

export function useJournalNote(date: string) {
  const userId = useCurrentUserId()
  return useQuery({
    queryKey: ['journal', userId, date],
    queryFn: () => journalRepository.getByDate(userId, date),
    enabled: !!userId && !!date,
  })
}

export function useSaveJournalNote() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (note: DailyNote) => journalRepository.upsert(note),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['journal'] }),
  })
}

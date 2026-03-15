import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { eventRepository } from '@/db/eventRepository'
import { useCurrentUserId } from '@/store/useAuthStore'
import type { CalendarEvent } from '@/types/event.types'
import { format, startOfMonth, endOfMonth, parse } from 'date-fns'

function getMonthRange(month: string): [string, string] {
  const date = parse(month, 'yyyy-MM', new Date())
  return [
    format(startOfMonth(date), 'yyyy-MM-dd'),
    format(endOfMonth(date), 'yyyy-MM-dd') + 'T23:59:59',
  ]
}

export function useEvents(month: string) {
  const userId = useCurrentUserId()
  const [from, to] = getMonthRange(month)
  return useQuery({
    queryKey: ['events', userId, month],
    queryFn: () => eventRepository.getByDateRange(userId, from, to),
    enabled: !!userId,
  })
}

export function useCreateEvent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (event: CalendarEvent) => eventRepository.create(event),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['events'] }),
  })
}

export function useUpdateEvent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, changes }: { id: string; changes: Partial<CalendarEvent> }) =>
      eventRepository.update(id, changes),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['events'] }),
  })
}

export function useDeleteEvent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => eventRepository.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['events'] }),
  })
}

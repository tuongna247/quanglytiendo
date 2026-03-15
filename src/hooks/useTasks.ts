import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { taskRepository } from '@/db/taskRepository'
import { useCurrentUserId } from '@/store/useAuthStore'
import type { Task } from '@/types/task.types'

export function useTasks() {
  const userId = useCurrentUserId()
  return useQuery({
    queryKey: ['tasks', userId],
    queryFn: () => taskRepository.getByUser(userId),
    enabled: !!userId,
  })
}

export function useTask(id: string) {
  return useQuery({
    queryKey: ['task', id],
    queryFn: () => taskRepository.getById(id),
    enabled: !!id,
  })
}

export function useCreateTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (task: Task) => taskRepository.create(task),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  })
}

export function useUpdateTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, changes }: { id: string; changes: Partial<Task> }) =>
      taskRepository.update(id, changes),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  })
}

export function useDeleteTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => taskRepository.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  })
}

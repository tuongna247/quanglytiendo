import { create } from 'zustand'
import type { TaskStatus, TaskPriority } from '@/types/task.types'

interface TaskState {
  view: 'list' | 'kanban'
  setView: (v: 'list' | 'kanban') => void
  filterStatus: TaskStatus | 'all'
  setFilterStatus: (s: TaskStatus | 'all') => void
  filterPriority: TaskPriority | 'all'
  setFilterPriority: (p: TaskPriority | 'all') => void
  modalOpen: boolean
  editingId: string | null
  openModal: (id?: string) => void
  closeModal: () => void
}

export const useTaskStore = create<TaskState>((set) => ({
  view: 'list',
  setView: (view) => set({ view }),
  filterStatus: 'all',
  setFilterStatus: (filterStatus) => set({ filterStatus }),
  filterPriority: 'all',
  setFilterPriority: (filterPriority) => set({ filterPriority }),
  modalOpen: false,
  editingId: null,
  openModal: (id) => set({ modalOpen: true, editingId: id ?? null }),
  closeModal: () => set({ modalOpen: false, editingId: null }),
}))

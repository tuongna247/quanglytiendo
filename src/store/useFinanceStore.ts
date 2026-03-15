import { create } from 'zustand'
import type { FinancePeriod } from '@/types/finance.types'

interface FinanceState {
  period: FinancePeriod
  setPeriod: (p: FinancePeriod) => void
  modalOpen: boolean
  editingId: string | null
  openModal: (id?: string) => void
  closeModal: () => void
}

export const useFinanceStore = create<FinanceState>((set) => ({
  period: 'month',
  setPeriod: (period) => set({ period }),
  modalOpen: false,
  editingId: null,
  openModal: (id) => set({ modalOpen: true, editingId: id ?? null }),
  closeModal: () => set({ modalOpen: false, editingId: null }),
}))

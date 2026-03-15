export type TransactionType = 'income' | 'expense'
export type FinancePeriod = 'day' | 'week' | 'month' | 'year'

export interface Transaction {
  id: string
  userId: string
  type: TransactionType
  amount: number
  category: string
  description: string
  date: string
  paymentMethod?: string
  tags: string[]
  createdAt: string
  updatedAt: string
}

import { useTranslation } from 'react-i18next'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import type { Transaction } from '@/types/finance.types'
import { formatCurrency } from '@/lib/utils'

interface Props { transactions: Transaction[] }

export default function FinanceChart({ transactions }: Props) {
  const { t } = useTranslation()

  // Group by category
  const byCategory = transactions.reduce<Record<string, { income: number; expense: number }>>((acc, tx) => {
    if (!acc[tx.category]) acc[tx.category] = { income: 0, expense: 0 }
    acc[tx.category][tx.type] += tx.amount
    return acc
  }, {})

  const data = Object.entries(byCategory).map(([name, vals]) => ({ name, ...vals }))

  if (data.length === 0) return null

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 4, right: 8, left: 8, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
          <YAxis tickFormatter={(v) => formatCurrency(v as number).replace('₫', '').trim()} tick={{ fontSize: 11 }} />
          <Tooltip formatter={(v) => formatCurrency(v as number)} />
          <Legend />
          <Bar dataKey="income" name={t('finance.income')} fill="#22c55e" radius={[4, 4, 0, 0]} />
          <Bar dataKey="expense" name={t('finance.expense')} fill="#ef4444" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

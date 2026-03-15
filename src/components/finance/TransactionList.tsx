import { useTranslation } from 'react-i18next'
import { formatCurrency, formatDate } from '@/lib/utils'
import { useDeleteTransaction } from '@/hooks/useFinance'
import { useFinanceStore } from '@/store/useFinanceStore'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Pencil, Trash2 } from 'lucide-react'
import type { Transaction } from '@/types/finance.types'

interface Props { transactions: Transaction[] }

export default function TransactionList({ transactions }: Props) {
  const { t } = useTranslation()
  const { openModal } = useFinanceStore()
  const del = useDeleteTransaction()

  if (transactions.length === 0) {
    return <p className="text-center text-muted-foreground py-8">{t('common.noData')}</p>
  }

  // Sort newest first
  const sorted = [...transactions].sort((a, b) => b.date.localeCompare(a.date))

  return (
    <div className="space-y-2">
      {sorted.map(tx => (
        <div key={tx.id} className="flex items-center gap-3 rounded-lg border bg-card px-4 py-3">
          <div className={`w-2 h-10 rounded-full shrink-0 ${tx.type === 'income' ? 'bg-green-500' : 'bg-red-500'}`} />
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{tx.description}</p>
            <p className="text-xs text-muted-foreground">{tx.category} · {formatDate(tx.date)}{tx.paymentMethod ? ` · ${tx.paymentMethod}` : ''}</p>
          </div>
          <span className={`font-semibold tabular-nums shrink-0 ${tx.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
            {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
          </span>
          <div className="flex gap-1 shrink-0">
            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openModal(tx.id)}>
              <Pencil size={14} />
            </Button>
            <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => del.mutate(tx.id)}>
              <Trash2 size={14} />
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}

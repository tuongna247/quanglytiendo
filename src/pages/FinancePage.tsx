import { useTranslation } from 'react-i18next'
import { useFinanceStore } from '@/store/useFinanceStore'
import { useTransactions } from '@/hooks/useFinance'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus } from 'lucide-react'
import BalanceCard from '@/components/finance/BalanceCard'
import FinanceChart from '@/components/finance/FinanceChart'
import TransactionList from '@/components/finance/TransactionList'
import TransactionModal from '@/components/finance/TransactionModal'
import type { FinancePeriod } from '@/types/finance.types'

const PERIODS: { value: FinancePeriod; labelKey: string }[] = [
  { value: 'day', labelKey: 'finance.period.day' },
  { value: 'week', labelKey: 'finance.period.week' },
  { value: 'month', labelKey: 'finance.period.month' },
  { value: 'year', labelKey: 'finance.period.year' },
]

export default function FinancePage() {
  const { t } = useTranslation()
  const { period, setPeriod, openModal, editingId } = useFinanceStore()
  const { data: transactions = [], isLoading } = useTransactions(period)

  const editing = editingId ? transactions.find(tx => tx.id === editingId) : undefined

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('finance.title')}</h1>
        <Button onClick={() => openModal()} size="sm">
          <Plus size={16} />
          {t('finance.addTransaction')}
        </Button>
      </div>

      <Tabs value={period} onValueChange={(v) => setPeriod(v as FinancePeriod)}>
        <TabsList>
          {PERIODS.map(p => (
            <TabsTrigger key={p.value} value={p.value}>{t(p.labelKey)}</TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {isLoading ? (
        <p className="text-muted-foreground">{t('common.loading')}</p>
      ) : (
        <>
          <BalanceCard transactions={transactions} />
          <FinanceChart transactions={transactions} />
          <TransactionList transactions={transactions} />
        </>
      )}

      <TransactionModal existing={editing} />
    </div>
  )
}

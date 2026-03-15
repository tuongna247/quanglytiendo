import { useTranslation } from 'react-i18next'
import { Card, CardContent } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import type { Transaction } from '@/types/finance.types'
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react'

interface Props { transactions: Transaction[] }

export default function BalanceCard({ transactions }: Props) {
  const { t } = useTranslation()
  const income = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const expense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const balance = income - expense

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{t('finance.income')}</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(income)}</p>
            </div>
            <TrendingUp className="text-green-500" size={32} />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{t('finance.expense')}</p>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(expense)}</p>
            </div>
            <TrendingDown className="text-red-500" size={32} />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{t('finance.balance')}</p>
              <p className={`text-2xl font-bold ${balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                {formatCurrency(balance)}
              </p>
            </div>
            <Wallet className="text-blue-500" size={32} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

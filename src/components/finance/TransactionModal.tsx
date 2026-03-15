import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { nanoid } from 'nanoid'
import { useTranslation } from 'react-i18next'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useFinanceStore } from '@/store/useFinanceStore'
import { useCreateTransaction, useUpdateTransaction } from '@/hooks/useFinance'
import { useCurrentUserId } from '@/store/useAuthStore'
import { EXPENSE_CATEGORIES_VI, INCOME_CATEGORIES_VI, PAYMENT_METHODS } from '@/lib/constants'
import { nowISO, todayStr } from '@/lib/utils'
import type { Transaction } from '@/types/finance.types'

const schema = z.object({
  type: z.enum(['income', 'expense']),
  amount: z.coerce.number().positive('Phải > 0'),
  category: z.string().min(1, 'Bắt buộc'),
  description: z.string().min(1, 'Bắt buộc'),
  date: z.string().min(1, 'Bắt buộc'),
  paymentMethod: z.string().optional(),
})
type FormData = z.infer<typeof schema>

interface Props { existing?: Transaction }

export default function TransactionModal({ existing }: Props) {
  const { t } = useTranslation()
  const { modalOpen, closeModal } = useFinanceStore()
  const userId = useCurrentUserId()
  const create = useCreateTransaction()
  const update = useUpdateTransaction()

  const { register, handleSubmit, watch, setValue, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { type: 'expense', date: todayStr() },
  })

  const type = watch('type')

  useEffect(() => {
    if (existing) {
      reset({
        type: existing.type,
        amount: existing.amount,
        category: existing.category,
        description: existing.description,
        date: existing.date,
        paymentMethod: existing.paymentMethod,
      })
    } else {
      reset({ type: 'expense', date: todayStr() })
    }
  }, [existing, reset])

  const categories = type === 'income' ? INCOME_CATEGORIES_VI : EXPENSE_CATEGORIES_VI

  const onSubmit = async (data: FormData) => {
    const now = nowISO()
    if (existing) {
      await update.mutateAsync({ id: existing.id, changes: { ...data, updatedAt: now } })
    } else {
      const tx: Transaction = {
        id: nanoid(), userId, tags: [], createdAt: now, updatedAt: now,
        description: data.description, type: data.type, amount: data.amount,
        category: data.category, date: data.date, paymentMethod: data.paymentMethod,
      }
      await create.mutateAsync(tx)
    }
    closeModal()
  }

  return (
    <Dialog open={modalOpen} onOpenChange={(o) => !o && closeModal()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{existing ? t('common.edit') : t('finance.addTransaction')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Type */}
          <div className="space-y-1">
            <Label>{t('common.category')}</Label>
            <Select value={type} onValueChange={(v) => setValue('type', v as 'income' | 'expense')}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="income">{t('finance.income')}</SelectItem>
                <SelectItem value="expense">{t('finance.expense')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Amount */}
          <div className="space-y-1">
            <Label>{t('finance.amount')}</Label>
            <Input type="number" {...register('amount')} placeholder="0" />
            {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
          </div>

          {/* Category */}
          <div className="space-y-1">
            <Label>{t('common.category')}</Label>
            <Select value={watch('category') ?? ''} onValueChange={(v) => setValue('category', v)}>
              <SelectTrigger><SelectValue placeholder="Chọn danh mục" /></SelectTrigger>
              <SelectContent>
                {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            {errors.category && <p className="text-xs text-destructive">{errors.category.message}</p>}
          </div>

          {/* Description */}
          <div className="space-y-1">
            <Label>{t('common.description')}</Label>
            <Textarea {...register('description')} rows={2} />
            {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
          </div>

          {/* Date */}
          <div className="space-y-1">
            <Label>{t('common.date')}</Label>
            <Input type="date" {...register('date')} />
            {errors.date && <p className="text-xs text-destructive">{errors.date.message}</p>}
          </div>

          {/* Payment method */}
          <div className="space-y-1">
            <Label>{t('finance.paymentMethod')}</Label>
            <Select value={watch('paymentMethod') ?? ''} onValueChange={(v) => setValue('paymentMethod', v)}>
              <SelectTrigger><SelectValue placeholder="Chọn phương thức" /></SelectTrigger>
              <SelectContent>
                {PAYMENT_METHODS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeModal}>{t('common.cancel')}</Button>
            <Button type="submit" disabled={isSubmitting}>{t('common.save')}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { nanoid } from 'nanoid'
import { useTranslation } from 'react-i18next'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useTaskStore } from '@/store/useTaskStore'
import { useCreateTask, useUpdateTask } from '@/hooks/useTasks'
import { useCurrentUserId } from '@/store/useAuthStore'
import { TASK_CATEGORIES } from '@/lib/constants'
import { nowISO } from '@/lib/utils'
import StepList from './StepList'
import type { Task, TaskStep, TaskStatus, TaskPriority } from '@/types/task.types'
import { Plus } from 'lucide-react'

const schema = z.object({
  title: z.string().min(1, 'Bắt buộc'),
  description: z.string().optional(),
  status: z.enum(['todo', 'in_progress', 'done', 'cancelled']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  category: z.string().min(1, 'Bắt buộc'),
  dueDate: z.string().optional(),
  estimatedMinutes: z.coerce.number().optional(),
})
type FormData = z.infer<typeof schema>

interface Props { existing?: Task }

export default function TaskModal({ existing }: Props) {
  const { t } = useTranslation()
  const { modalOpen, closeModal } = useTaskStore()
  const userId = useCurrentUserId()
  const create = useCreateTask()
  const update = useUpdateTask()
  const [steps, setSteps] = useState<TaskStep[]>([])

  const { register, handleSubmit, watch, setValue, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { status: 'todo', priority: 'medium', category: TASK_CATEGORIES[0] },
  })

  useEffect(() => {
    if (existing) {
      reset({
        title: existing.title,
        description: existing.description,
        status: existing.status,
        priority: existing.priority,
        category: existing.category,
        dueDate: existing.dueDate,
        estimatedMinutes: existing.estimatedMinutes,
      })
      setSteps(existing.steps)
    } else {
      reset({ status: 'todo', priority: 'medium', category: TASK_CATEGORIES[0] })
      setSteps([])
    }
  }, [existing, reset])

  const addStep = () => {
    setSteps(prev => [...prev, { id: nanoid(), order: prev.length, title: '', isDone: false }])
  }

  const onSubmit = async (data: FormData) => {
    const now = nowISO()
    if (existing) {
      await update.mutateAsync({ id: existing.id, changes: { ...data, steps, updatedAt: now } })
    } else {
      const task: Task = {
        id: nanoid(), userId, tags: [], steps, createdAt: now, updatedAt: now,
        title: data.title, description: data.description, status: data.status as TaskStatus,
        priority: data.priority as TaskPriority, category: data.category,
        dueDate: data.dueDate, estimatedMinutes: data.estimatedMinutes,
      }
      await create.mutateAsync(task)
    }
    closeModal()
  }

  return (
    <Dialog open={modalOpen} onOpenChange={(o) => !o && closeModal()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{existing ? t('common.edit') : t('tasks.addTask')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <Label>{t('common.title')}</Label>
            <Input {...register('title')} autoFocus />
            {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
          </div>

          <div className="space-y-1">
            <Label>{t('common.description')}</Label>
            <Textarea {...register('description')} rows={2} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>{t('common.status')}</Label>
              <Select value={watch('status')} onValueChange={(v) => setValue('status', v as TaskStatus)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(['todo', 'in_progress', 'done', 'cancelled'] as const).map(s => (
                    <SelectItem key={s} value={s}>{t(`status.${s}`)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>{t('common.priority')}</Label>
              <Select value={watch('priority')} onValueChange={(v) => setValue('priority', v as TaskPriority)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(['low', 'medium', 'high', 'urgent'] as const).map(p => (
                    <SelectItem key={p} value={p}>{t(`priority.${p}`)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>{t('common.category')}</Label>
              <Select value={watch('category')} onValueChange={(v) => setValue('category', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TASK_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>{t('tasks.dueDate')}</Label>
              <Input type="date" {...register('dueDate')} />
            </div>
          </div>

          <div className="space-y-1">
            <Label>{t('tasks.estimatedTime')}</Label>
            <Input type="number" {...register('estimatedMinutes')} placeholder="30" />
          </div>

          {/* Steps */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>{t('tasks.steps')}</Label>
              <Button type="button" size="sm" variant="outline" onClick={addStep}>
                <Plus size={14} /> {t('tasks.addStep')}
              </Button>
            </div>
            <StepList steps={steps} onChange={setSteps} />
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

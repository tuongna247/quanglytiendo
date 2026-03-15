import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { PRIORITY_COLORS, STATUS_COLORS } from '@/lib/constants'
import { formatDate } from '@/lib/utils'
import { useDeleteTask } from '@/hooks/useTasks'
import { useTaskStore } from '@/store/useTaskStore'
import { Pencil, Trash2, Calendar, Clock } from 'lucide-react'
import type { Task } from '@/types/task.types'

interface Props { task: Task }

export default function TaskCard({ task }: Props) {
  const { t } = useTranslation()
  const { openModal } = useTaskStore()
  const del = useDeleteTask()
  const doneSteps = task.steps.filter(s => s.isDone).length
  const totalSteps = task.steps.length

  return (
    <Card className="group">
      <CardContent className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className={`font-medium text-sm leading-snug ${task.status === 'done' ? 'line-through text-muted-foreground' : ''}`}>
              {task.title}
            </p>
            {task.description && (
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{task.description}</p>
            )}
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openModal(task.id)}>
              <Pencil size={12} />
            </Button>
            <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => del.mutate(task.id)}>
              <Trash2 size={12} />
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <Badge className={PRIORITY_COLORS[task.priority]} variant="outline">
            {t(`priority.${task.priority}`)}
          </Badge>
          <Badge className={STATUS_COLORS[task.status]} variant="outline">
            {t(`status.${task.status}`)}
          </Badge>
          <Badge variant="outline">{task.category}</Badge>
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {task.dueDate && (
            <span className="flex items-center gap-1">
              <Calendar size={11} /> {formatDate(task.dueDate)}
            </span>
          )}
          {task.estimatedMinutes && (
            <span className="flex items-center gap-1">
              <Clock size={11} /> {task.estimatedMinutes}m
            </span>
          )}
          {totalSteps > 0 && (
            <span>{doneSteps}/{totalSteps} bước</span>
          )}
        </div>

        {totalSteps > 0 && (
          <div className="w-full bg-muted rounded-full h-1.5">
            <div
              className="bg-primary h-1.5 rounded-full transition-all"
              style={{ width: `${(doneSteps / totalSteps) * 100}%` }}
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}

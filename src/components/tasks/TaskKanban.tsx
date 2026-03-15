import { useTranslation } from 'react-i18next'
import TaskCard from './TaskCard'
import type { Task, TaskStatus } from '@/types/task.types'

const COLUMNS: TaskStatus[] = ['todo', 'in_progress', 'done', 'cancelled']

interface Props { tasks: Task[] }

export default function TaskKanban({ tasks }: Props) {
  const { t } = useTranslation()

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {COLUMNS.map(status => {
        const col = tasks.filter(t => t.status === status)
        return (
          <div key={status} className="space-y-2">
            <div className="flex items-center gap-2 px-1">
              <h3 className="text-sm font-semibold">{t(`status.${status}`)}</h3>
              <span className="text-xs bg-muted px-1.5 py-0.5 rounded-full">{col.length}</span>
            </div>
            <div className="space-y-2 min-h-[120px] rounded-lg bg-muted/30 p-2">
              {col.map(task => <TaskCard key={task.id} task={task} />)}
              {col.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">Trống</p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

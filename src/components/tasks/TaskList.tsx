import { useTranslation } from 'react-i18next'
import TaskCard from './TaskCard'
import type { Task } from '@/types/task.types'

interface Props { tasks: Task[] }

export default function TaskList({ tasks }: Props) {
  const { t } = useTranslation()
  if (tasks.length === 0) {
    return <p className="text-center text-muted-foreground py-8">{t('tasks.noTasks')}</p>
  }
  return (
    <div className="space-y-3">
      {tasks.map(task => <TaskCard key={task.id} task={task} />)}
    </div>
  )
}

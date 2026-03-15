import { useTranslation } from 'react-i18next'
import { useTaskStore } from '@/store/useTaskStore'
import { useTasks } from '@/hooks/useTasks'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, List, LayoutGrid } from 'lucide-react'
import TaskList from '@/components/tasks/TaskList'
import TaskKanban from '@/components/tasks/TaskKanban'
import TaskModal from '@/components/tasks/TaskModal'
import type { TaskStatus, TaskPriority } from '@/types/task.types'

export default function TasksPage() {
  const { t } = useTranslation()
  const { view, setView, filterStatus, setFilterStatus, filterPriority, setFilterPriority, openModal, editingId } = useTaskStore()
  const { data: allTasks = [], isLoading } = useTasks()

  const filtered = allTasks.filter(task => {
    if (filterStatus !== 'all' && task.status !== filterStatus) return false
    if (filterPriority !== 'all' && task.priority !== filterPriority) return false
    return true
  })

  const editing = editingId ? allTasks.find(t => t.id === editingId) : undefined

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('tasks.title')}</h1>
        <Button onClick={() => openModal()} size="sm">
          <Plus size={16} />
          {t('tasks.addTask')}
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {/* View toggle */}
        <Tabs value={view} onValueChange={(v) => setView(v as 'list' | 'kanban')}>
          <TabsList className="h-9">
            <TabsTrigger value="list" className="px-3 gap-1.5"><List size={14} /> {t('tasks.list')}</TabsTrigger>
            <TabsTrigger value="kanban" className="px-3 gap-1.5"><LayoutGrid size={14} /> {t('tasks.kanban')}</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Status filter */}
        <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as TaskStatus | 'all')}>
          <SelectTrigger className="h-9 w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('common.all')}</SelectItem>
            {(['todo', 'in_progress', 'done', 'cancelled'] as const).map(s => (
              <SelectItem key={s} value={s}>{t(`status.${s}`)}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Priority filter */}
        <Select value={filterPriority} onValueChange={(v) => setFilterPriority(v as TaskPriority | 'all')}>
          <SelectTrigger className="h-9 w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('common.all')}</SelectItem>
            {(['low', 'medium', 'high', 'urgent'] as const).map(p => (
              <SelectItem key={p} value={p}>{t(`priority.${p}`)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">{t('common.loading')}</p>
      ) : view === 'list' ? (
        <TaskList tasks={filtered} />
      ) : (
        <TaskKanban tasks={filtered} />
      )}

      <TaskModal existing={editing} />
    </div>
  )
}

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { format, addDays, subDays, parseISO } from 'date-fns'
import { vi } from 'date-fns/locale'
import { nanoid } from 'nanoid'
import { ChevronLeft, ChevronRight, Trash2, Pencil, Check, GripVertical, Plus } from 'lucide-react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useCurrentUserId } from '@/store/useAuthStore'
import { usePlannerItems, useCreatePlannerItem, useUpdatePlannerItem, useDeletePlannerItem } from '@/hooks/usePlanner'
import { todayStr, nowISO } from '@/lib/utils'
import { PRIORITY_COLORS } from '@/lib/constants'
import type { PlannerItem } from '@/types/planner.types'

const PRIORITY_LABELS: Record<string, string> = {
  low: 'Thấp',
  medium: 'Trung bình',
  high: 'Cao',
}

interface SortableItemProps {
  item: PlannerItem
  onToggle: (item: PlannerItem) => void
  onEdit: (item: PlannerItem) => void
  onDelete: (id: string) => void
}

function SortableItem({ item, onToggle, onEdit, onDelete }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 p-3 bg-white border rounded-lg group hover:shadow-sm transition-shadow"
    >
      <button
        className="cursor-grab text-muted-foreground hover:text-foreground"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <Checkbox
        checked={item.isDone}
        onCheckedChange={() => onToggle(item)}
      />
      <div className="flex-1 min-w-0">
        <span className={`text-sm font-medium ${item.isDone ? 'line-through text-muted-foreground' : ''}`}>
          {item.title}
        </span>
        {item.estimatedMinutes && (
          <span className="text-xs text-muted-foreground ml-2">{item.estimatedMinutes} phút</span>
        )}
        {item.notes && (
          <p className="text-xs text-muted-foreground truncate mt-0.5">{item.notes}</p>
        )}
      </div>
      <Badge className={`text-xs ${PRIORITY_COLORS[item.priority]}`}>
        {PRIORITY_LABELS[item.priority]}
      </Badge>
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => onEdit(item)}>
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => onDelete(item.id)}>
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  )
}

interface ItemFormData {
  title: string
  notes: string
  priority: 'low' | 'medium' | 'high'
  estimatedMinutes: string
}

const defaultItemForm: ItemFormData = {
  title: '',
  notes: '',
  priority: 'medium',
  estimatedMinutes: '',
}

export default function PlannerPage() {
  const { t } = useTranslation()
  const userId = useCurrentUserId()
  const [selectedDate, setSelectedDate] = useState(todayStr())
  const { data: items = [] } = usePlannerItems(selectedDate)
  const createItem = useCreatePlannerItem()
  const updateItem = useUpdatePlannerItem()
  const deleteItem = useDeletePlannerItem()

  const [editingItem, setEditingItem] = useState<PlannerItem | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [itemForm, setItemForm] = useState<ItemFormData>(defaultItemForm)
  const [addTitle, setAddTitle] = useState('')

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const sortedItems = [...items].sort((a, b) => a.order - b.order)

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = sortedItems.findIndex(i => i.id === active.id)
    const newIndex = sortedItems.findIndex(i => i.id === over.id)
    const reordered = arrayMove(sortedItems, oldIndex, newIndex)
    await Promise.all(
      reordered.map((item, idx) =>
        updateItem.mutateAsync({ id: item.id, changes: { order: idx } })
      )
    )
  }

  async function handleToggle(item: PlannerItem) {
    const now = nowISO()
    await updateItem.mutateAsync({
      id: item.id,
      changes: {
        isDone: !item.isDone,
        completedAt: !item.isDone ? now : undefined,
        updatedAt: now,
      },
    })
  }

  async function handleQuickAdd() {
    if (!addTitle.trim()) return
    const now = nowISO()
    await createItem.mutateAsync({
      id: nanoid(),
      userId,
      date: selectedDate,
      order: sortedItems.length,
      title: addTitle.trim(),
      isDone: false,
      priority: 'medium',
      createdAt: now,
      updatedAt: now,
    })
    setAddTitle('')
  }

  function openEdit(item: PlannerItem) {
    setEditingItem(item)
    setItemForm({
      title: item.title,
      notes: item.notes ?? '',
      priority: item.priority,
      estimatedMinutes: item.estimatedMinutes?.toString() ?? '',
    })
    setModalOpen(true)
  }

  function openNew() {
    setEditingItem(null)
    setItemForm(defaultItemForm)
    setModalOpen(true)
  }

  async function handleModalSave() {
    if (!itemForm.title.trim()) return
    const now = nowISO()
    if (editingItem) {
      await updateItem.mutateAsync({
        id: editingItem.id,
        changes: {
          title: itemForm.title,
          notes: itemForm.notes || undefined,
          priority: itemForm.priority,
          estimatedMinutes: itemForm.estimatedMinutes ? parseInt(itemForm.estimatedMinutes) : undefined,
          updatedAt: now,
        },
      })
    } else {
      await createItem.mutateAsync({
        id: nanoid(),
        userId,
        date: selectedDate,
        order: sortedItems.length,
        title: itemForm.title,
        notes: itemForm.notes || undefined,
        priority: itemForm.priority,
        estimatedMinutes: itemForm.estimatedMinutes ? parseInt(itemForm.estimatedMinutes) : undefined,
        isDone: false,
        createdAt: now,
        updatedAt: now,
      })
    }
    setModalOpen(false)
  }

  const displayDate = format(parseISO(selectedDate), 'EEEE, dd/MM/yyyy', { locale: vi })
  const doneCount = sortedItems.filter(i => i.isDone).length

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('nav.planner')}</h1>
        <Button size="sm" onClick={openNew}>
          <Plus className="h-4 w-4 mr-1" /> Thêm
        </Button>
      </div>

      {/* Date Navigation */}
      <div className="flex items-center justify-between bg-white border rounded-lg p-3">
        <Button variant="outline" size="icon" onClick={() => setSelectedDate(d => format(subDays(parseISO(d), 1), 'yyyy-MM-dd'))}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="text-center">
          <div className="font-semibold capitalize">{displayDate}</div>
          <div className="text-xs text-muted-foreground">{doneCount}/{sortedItems.length} hoàn thành</div>
        </div>
        <Button variant="outline" size="icon" onClick={() => setSelectedDate(d => format(addDays(parseISO(d), 1), 'yyyy-MM-dd'))}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Quick add */}
      <div className="flex gap-2">
        <Input
          placeholder="Thêm nhanh công việc..."
          value={addTitle}
          onChange={e => setAddTitle(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleQuickAdd()}
        />
        <Button onClick={handleQuickAdd} disabled={!addTitle.trim()}>Thêm</Button>
      </div>

      {/* Items List */}
      {sortedItems.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          Chưa có công việc nào cho ngày này.
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={sortedItems.map(i => i.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {sortedItems.map(item => (
                <SortableItem
                  key={item.id}
                  item={item}
                  onToggle={handleToggle}
                  onEdit={openEdit}
                  onDelete={id => deleteItem.mutate(id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Chỉnh sửa' : 'Thêm công việc'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Tiêu đề *</Label>
              <Input
                value={itemForm.title}
                onChange={e => setItemForm(f => ({ ...f, title: e.target.value }))}
                placeholder="Tên công việc"
              />
            </div>
            <div>
              <Label>Ghi chú</Label>
              <Textarea
                value={itemForm.notes}
                onChange={e => setItemForm(f => ({ ...f, notes: e.target.value }))}
                placeholder="Ghi chú (tùy chọn)"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Độ ưu tiên</Label>
                <Select value={itemForm.priority} onValueChange={v => setItemForm(f => ({ ...f, priority: v as 'low'|'medium'|'high' }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Thấp</SelectItem>
                    <SelectItem value="medium">Trung bình</SelectItem>
                    <SelectItem value="high">Cao</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Thời gian ước tính (phút)</Label>
                <Input
                  type="number"
                  value={itemForm.estimatedMinutes}
                  onChange={e => setItemForm(f => ({ ...f, estimatedMinutes: e.target.value }))}
                  placeholder="30"
                  min={1}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>{t('common.cancel')}</Button>
            <Button onClick={handleModalSave} disabled={!itemForm.title.trim()}>{t('common.save')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

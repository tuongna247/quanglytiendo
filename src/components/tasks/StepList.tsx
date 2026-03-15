import { useState } from 'react'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Trash2 } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import type { TaskStep } from '@/types/task.types'

interface StepItemProps {
  step: TaskStep
  onChange: (s: TaskStep) => void
  onDelete: () => void
}

function StepItem({ step, onChange, onDelete }: StepItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: step.id })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-2 py-1">
      <button type="button" {...attributes} {...listeners} className="cursor-grab text-muted-foreground">
        <GripVertical size={16} />
      </button>
      <Checkbox
        checked={step.isDone}
        onCheckedChange={(v) => onChange({ ...step, isDone: !!v })}
      />
      <Input
        value={step.title}
        onChange={(e) => onChange({ ...step, title: e.target.value })}
        className={`h-8 flex-1 text-sm ${step.isDone ? 'line-through text-muted-foreground' : ''}`}
        placeholder="Tên bước..."
      />
      <Button type="button" size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={onDelete}>
        <Trash2 size={14} />
      </Button>
    </div>
  )
}

interface Props {
  steps: TaskStep[]
  onChange: (steps: TaskStep[]) => void
}

export default function StepList({ steps, onChange }: Props) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIdx = steps.findIndex(s => s.id === active.id)
      const newIdx = steps.findIndex(s => s.id === over.id)
      const moved = arrayMove(steps, oldIdx, newIdx).map((s, i) => ({ ...s, order: i }))
      onChange(moved)
    }
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={steps.map(s => s.id)} strategy={verticalListSortingStrategy}>
        {steps.map((step) => (
          <StepItem
            key={step.id}
            step={step}
            onChange={(updated) => onChange(steps.map(s => s.id === updated.id ? updated : s))}
            onDelete={() => onChange(steps.filter(s => s.id !== step.id).map((s, i) => ({ ...s, order: i })))}
          />
        ))}
      </SortableContext>
    </DndContext>
  )
}

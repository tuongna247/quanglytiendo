import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, addMonths, subMonths, parseISO } from 'date-fns'
import { vi } from 'date-fns/locale'
import { nanoid } from 'nanoid'
import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useCurrentUserId } from '@/store/useAuthStore'
import { useEvents, useCreateEvent, useUpdateEvent, useDeleteEvent } from '@/hooks/useCalendar'
import { nowISO } from '@/lib/utils'
import { EVENT_COLORS } from '@/lib/constants'
import type { CalendarEvent, RecurrenceRule } from '@/types/event.types'

const WEEKDAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']

function buildCalendarDays(month: Date): Date[] {
  const start = startOfWeek(startOfMonth(month), { weekStartsOn: 0 })
  const end = endOfWeek(endOfMonth(month), { weekStartsOn: 0 })
  const days: Date[] = []
  let cur = start
  while (cur <= end) {
    days.push(cur)
    cur = addDays(cur, 1)
  }
  return days
}

interface EventFormData {
  title: string
  description: string
  startAt: string
  endAt: string
  allDay: boolean
  color: string
  category: string
  recurrence: RecurrenceRule
}

const defaultForm = (dateStr: string): EventFormData => ({
  title: '',
  description: '',
  startAt: `${dateStr}T08:00`,
  endAt: `${dateStr}T09:00`,
  allDay: false,
  color: EVENT_COLORS[5],
  category: '',
  recurrence: 'none',
})

export default function CalendarPage() {
  const { t } = useTranslation()
  const userId = useCurrentUserId()
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const monthKey = format(currentMonth, 'yyyy-MM')
  const { data: events = [] } = useEvents(monthKey)
  const createEvent = useCreateEvent()
  const updateEvent = useUpdateEvent()
  const deleteEvent = useDeleteEvent()

  const [modalOpen, setModalOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null)
  const [form, setForm] = useState<EventFormData>(defaultForm(format(new Date(), 'yyyy-MM-dd')))

  const calendarDays = buildCalendarDays(currentMonth)

  const eventsForDay = (day: Date) =>
    events.filter(e => e.startAt.startsWith(format(day, 'yyyy-MM-dd')))

  function openNewEvent(day: Date) {
    const dateStr = format(day, 'yyyy-MM-dd')
    setEditingEvent(null)
    setForm(defaultForm(dateStr))
    setModalOpen(true)
  }

  function openEditEvent(e: CalendarEvent, evt: React.MouseEvent) {
    evt.stopPropagation()
    setEditingEvent(e)
    setForm({
      title: e.title,
      description: e.description ?? '',
      startAt: e.startAt.slice(0, 16),
      endAt: e.endAt.slice(0, 16),
      allDay: e.allDay,
      color: e.color,
      category: e.category,
      recurrence: e.recurrence,
    })
    setModalOpen(true)
  }

  async function handleSave() {
    if (!form.title.trim()) return
    const now = nowISO()
    if (editingEvent) {
      await updateEvent.mutateAsync({
        id: editingEvent.id,
        changes: {
          ...form,
          startAt: form.allDay ? form.startAt.split('T')[0] : form.startAt,
          endAt: form.allDay ? form.endAt.split('T')[0] : form.endAt,
          updatedAt: now,
        },
      })
    } else {
      const event: CalendarEvent = {
        id: nanoid(),
        userId,
        ...form,
        startAt: form.allDay ? form.startAt.split('T')[0] : form.startAt,
        endAt: form.allDay ? form.endAt.split('T')[0] : form.endAt,
        createdAt: now,
        updatedAt: now,
      }
      await createEvent.mutateAsync(event)
    }
    setModalOpen(false)
  }

  async function handleDelete() {
    if (editingEvent) {
      await deleteEvent.mutateAsync(editingEvent.id)
      setModalOpen(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('nav.calendar')}</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setCurrentMonth(m => subMonths(m, 1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-base font-semibold min-w-[140px] text-center capitalize">
            {format(currentMonth, 'MMMM yyyy', { locale: vi })}
          </span>
          <Button variant="outline" size="icon" onClick={() => setCurrentMonth(m => addMonths(m, 1))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button size="sm" onClick={() => openNewEvent(new Date())}>
            <Plus className="h-4 w-4 mr-1" /> Thêm sự kiện
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="border rounded-lg overflow-hidden bg-white">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 border-b bg-muted/50">
          {WEEKDAYS.map(d => (
            <div key={d} className="py-2 text-center text-xs font-semibold text-muted-foreground">
              {d}
            </div>
          ))}
        </div>
        {/* Days */}
        <div className="grid grid-cols-7">
          {calendarDays.map((day, idx) => {
            const isCurrentMonth = isSameMonth(day, currentMonth)
            const isToday = isSameDay(day, new Date())
            const dayEvents = eventsForDay(day)
            return (
              <div
                key={idx}
                onClick={() => openNewEvent(day)}
                className={`min-h-[90px] p-1 border-b border-r cursor-pointer hover:bg-muted/30 transition-colors ${
                  !isCurrentMonth ? 'opacity-40' : ''
                } ${isToday ? 'bg-blue-50' : ''}`}
              >
                <div className={`text-xs font-medium mb-1 w-6 h-6 flex items-center justify-center rounded-full ${
                  isToday ? 'bg-blue-600 text-white' : 'text-foreground'
                }`}>
                  {format(day, 'd')}
                </div>
                <div className="space-y-0.5">
                  {dayEvents.slice(0, 3).map(e => (
                    <div
                      key={e.id}
                      onClick={(evt) => openEditEvent(e, evt)}
                      className="text-xs px-1 py-0.5 rounded truncate text-white font-medium cursor-pointer hover:opacity-80"
                      style={{ backgroundColor: e.color }}
                    >
                      {e.title}
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-xs text-muted-foreground px-1">+{dayEvents.length - 3} khác</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Event Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingEvent ? 'Chỉnh sửa sự kiện' : 'Thêm sự kiện'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Tiêu đề *</Label>
              <Input
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="Tên sự kiện"
              />
            </div>
            <div>
              <Label>Mô tả</Label>
              <Textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Mô tả (tùy chọn)"
                rows={2}
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="allDay"
                checked={form.allDay}
                onCheckedChange={v => setForm(f => ({ ...f, allDay: !!v }))}
              />
              <Label htmlFor="allDay">Cả ngày</Label>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Bắt đầu</Label>
                <Input
                  type={form.allDay ? 'date' : 'datetime-local'}
                  value={form.allDay ? form.startAt.split('T')[0] : form.startAt}
                  onChange={e => setForm(f => ({
                    ...f,
                    startAt: form.allDay ? e.target.value : e.target.value,
                  }))}
                />
              </div>
              <div>
                <Label>Kết thúc</Label>
                <Input
                  type={form.allDay ? 'date' : 'datetime-local'}
                  value={form.allDay ? form.endAt.split('T')[0] : form.endAt}
                  onChange={e => setForm(f => ({
                    ...f,
                    endAt: form.allDay ? e.target.value : e.target.value,
                  }))}
                />
              </div>
            </div>
            <div>
              <Label>Danh mục</Label>
              <Input
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                placeholder="Danh mục (tuỳ chọn)"
              />
            </div>
            <div>
              <Label>Lặp lại</Label>
              <Select
                value={form.recurrence}
                onValueChange={v => setForm(f => ({ ...f, recurrence: v as RecurrenceRule }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Không lặp</SelectItem>
                  <SelectItem value="daily">Hằng ngày</SelectItem>
                  <SelectItem value="weekly">Hằng tuần</SelectItem>
                  <SelectItem value="monthly">Hằng tháng</SelectItem>
                  <SelectItem value="yearly">Hằng năm</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Màu sắc</Label>
              <div className="flex gap-2 mt-1 flex-wrap">
                {EVENT_COLORS.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, color }))}
                    className="w-7 h-7 rounded-full border-2 transition-all"
                    style={{
                      backgroundColor: color,
                      borderColor: form.color === color ? '#1e293b' : 'transparent',
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            {editingEvent && (
              <Button variant="destructive" onClick={handleDelete} className="mr-auto">
                Xóa
              </Button>
            )}
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleSave} disabled={!form.title.trim()}>
              {t('common.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

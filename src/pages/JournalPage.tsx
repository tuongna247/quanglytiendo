import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { format, addDays, subDays, parseISO } from 'date-fns'
import { vi } from 'date-fns/locale'
import { nanoid } from 'nanoid'
import { ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useCurrentUserId } from '@/store/useAuthStore'
import { useJournalNote, useSaveJournalNote } from '@/hooks/useJournal'
import { todayStr, nowISO } from '@/lib/utils'
import type { DailyNote, NoteTodo } from '@/types/journal.types'

export default function JournalPage() {
  const { t } = useTranslation()
  const userId = useCurrentUserId()
  const [selectedDate, setSelectedDate] = useState(todayStr())
  const { data: note } = useJournalNote(selectedDate)
  const saveNote = useSaveJournalNote()

  const [content, setContent] = useState('')
  const [todos, setTodos] = useState<NoteTodo[]>([])
  const [newTodoText, setNewTodoText] = useState('')

  // Sync note data into local state when it loads
  useEffect(() => {
    setContent(note?.content ?? '')
    setTodos(note?.todoItems ?? [])
  }, [note, selectedDate])

  function buildNote(): DailyNote {
    const now = nowISO()
    return {
      id: note?.id ?? nanoid(),
      userId,
      date: selectedDate,
      content,
      todoItems: todos,
      createdAt: note?.createdAt ?? now,
      updatedAt: now,
    }
  }

  async function handleContentBlur() {
    await saveNote.mutateAsync(buildNote())
  }

  async function handleAddTodo() {
    if (!newTodoText.trim()) return
    const updated: NoteTodo[] = [
      ...todos,
      { id: nanoid(), text: newTodoText.trim(), isDone: false },
    ]
    setTodos(updated)
    setNewTodoText('')
    await saveNote.mutateAsync({ ...buildNote(), todoItems: updated })
  }

  async function handleToggleTodo(id: string) {
    const now = nowISO()
    const updated = todos.map(t =>
      t.id === id
        ? { ...t, isDone: !t.isDone, completedAt: !t.isDone ? now : undefined }
        : t
    )
    setTodos(updated)
    await saveNote.mutateAsync({ ...buildNote(), todoItems: updated })
  }

  async function handleDeleteTodo(id: string) {
    const updated = todos.filter(t => t.id !== id)
    setTodos(updated)
    await saveNote.mutateAsync({ ...buildNote(), todoItems: updated })
  }

  const displayDate = format(parseISO(selectedDate), 'EEEE, dd/MM/yyyy', { locale: vi })

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">{t('nav.journal')}</h1>

      {/* Date Navigation */}
      <div className="flex items-center justify-between bg-white border rounded-lg p-3">
        <Button
          variant="outline" size="icon"
          onClick={() => setSelectedDate(d => format(subDays(parseISO(d), 1), 'yyyy-MM-dd'))}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="font-semibold capitalize">{displayDate}</span>
        <Button
          variant="outline" size="icon"
          onClick={() => setSelectedDate(d => format(addDays(parseISO(d), 1), 'yyyy-MM-dd'))}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('journal.writeSomething', 'Ghi chép hôm nay')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            onBlur={handleContentBlur}
            placeholder="Hôm nay bạn cảm thấy thế nào? Ghi lại những suy nghĩ, cảm xúc..."
            rows={8}
            className="resize-none"
          />
          <p className="text-xs text-muted-foreground mt-1">Tự động lưu khi rời khỏi ô nhập</p>
        </CardContent>
      </Card>

      {/* Todos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('journal.todos', 'Việc cần làm')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Add todo */}
          <div className="flex gap-2">
            <Input
              placeholder={t('journal.addTodo', 'Thêm việc cần làm...')}
              value={newTodoText}
              onChange={e => setNewTodoText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddTodo()}
            />
            <Button onClick={handleAddTodo} disabled={!newTodoText.trim()}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Todo list */}
          {todos.length === 0 ? (
            <p className="text-sm text-muted-foreground">Chưa có việc cần làm.</p>
          ) : (
            <div className="space-y-2">
              {todos.map(todo => (
                <div key={todo.id} className="flex items-center gap-2 group">
                  <Checkbox
                    checked={todo.isDone}
                    onCheckedChange={() => handleToggleTodo(todo.id)}
                  />
                  <span className={`flex-1 text-sm ${todo.isDone ? 'line-through text-muted-foreground' : ''}`}>
                    {todo.text}
                  </span>
                  <Button
                    variant="ghost" size="icon"
                    className="h-7 w-7 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleDeleteTodo(todo.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {todos.length > 0 && (
            <p className="text-xs text-muted-foreground">
              {todos.filter(t => t.isDone).length}/{todos.length} hoàn thành
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

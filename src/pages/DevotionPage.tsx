import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { format, addDays, subDays, parseISO } from 'date-fns'
import { vi } from 'date-fns/locale'
import { nanoid } from 'nanoid'
import { ChevronLeft, ChevronRight, Plus, Trash2, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useCurrentUserId } from '@/store/useAuthStore'
import { useDevotion, useSaveDevotion, useTodayBibleDay } from '@/hooks/useDevotion'
import { todayStr, nowISO } from '@/lib/utils'
import type { BiblePassage, DailyDevotion } from '@/types/devotion.types'

const MOOD_OPTIONS = [
  { value: 'grateful', label: 'Biết ơn' },
  { value: 'challenged', label: 'Thách thức' },
  { value: 'peaceful', label: 'Bình an' },
  { value: 'struggling', label: 'Vật lộn' },
  { value: 'joyful', label: 'Vui mừng' },
]

const emptyPassage = (): BiblePassage => ({ book: '', chapter: 0, verseStart: 0 })

interface PassageFormData {
  book: string
  chapter: string
  verseStart: string
  verseEnd: string
  text: string
}

function passageToForm(p: BiblePassage): PassageFormData {
  return {
    book: p.book,
    chapter: p.chapter.toString(),
    verseStart: p.verseStart.toString(),
    verseEnd: p.verseEnd?.toString() ?? '',
    text: p.text ?? '',
  }
}

function formToPassage(f: PassageFormData): BiblePassage {
  return {
    book: f.book,
    chapter: parseInt(f.chapter) || 0,
    verseStart: parseInt(f.verseStart) || 0,
    verseEnd: f.verseEnd ? parseInt(f.verseEnd) : undefined,
    text: f.text || undefined,
  }
}

const emptyPassageForm = (): PassageFormData => ({
  book: '', chapter: '', verseStart: '', verseEnd: '', text: '',
})

interface DevotionFormState {
  passages: PassageFormData[]
  bibleTeaches: string
  lessonLearned: string
  application: string
  prayerPoints: string
  memorizeVerse: string
  mood: string
}

const defaultForm = (): DevotionFormState => ({
  passages: [emptyPassageForm()],
  bibleTeaches: '',
  lessonLearned: '',
  application: '',
  prayerPoints: '',
  memorizeVerse: '',
  mood: '',
})

function devotionToForm(d: DailyDevotion): DevotionFormState {
  return {
    passages: d.passages.length > 0 ? d.passages.map(passageToForm) : [emptyPassageForm()],
    bibleTeaches: d.bibleTeaches,
    lessonLearned: d.lessonLearned,
    application: d.application,
    prayerPoints: d.prayerPoints ?? '',
    memorizeVerse: d.memorizeVerse ?? '',
    mood: d.mood ?? '',
  }
}

export default function DevotionPage() {
  const { t } = useTranslation()
  const userId = useCurrentUserId()
  const [selectedDate, setSelectedDate] = useState(todayStr())
  const { data: devotion } = useDevotion(selectedDate)
  const saveDevotion = useSaveDevotion()
  const { data: todayBibleDay } = useTodayBibleDay()

  const [form, setForm] = useState<DevotionFormState>(defaultForm())

  useEffect(() => {
    if (devotion) {
      setForm(devotionToForm(devotion))
    } else {
      setForm(defaultForm())
    }
  }, [devotion, selectedDate])

  function updatePassage(index: number, field: keyof PassageFormData, value: string) {
    setForm(f => ({
      ...f,
      passages: f.passages.map((p, i) => i === index ? { ...p, [field]: value } : p),
    }))
  }

  function addPassage() {
    setForm(f => ({ ...f, passages: [...f.passages, emptyPassageForm()] }))
  }

  function removePassage(index: number) {
    setForm(f => ({ ...f, passages: f.passages.filter((_, i) => i !== index) }))
  }

  async function handleSave() {
    const now = nowISO()
    const payload: DailyDevotion = {
      id: devotion?.id ?? nanoid(),
      userId,
      date: selectedDate,
      passages: form.passages.map(formToPassage).filter(p => p.book),
      bibleTeaches: form.bibleTeaches,
      lessonLearned: form.lessonLearned,
      application: form.application,
      prayerPoints: form.prayerPoints || undefined,
      memorizeVerse: form.memorizeVerse || undefined,
      mood: (form.mood as DailyDevotion['mood']) || undefined,
      createdAt: devotion?.createdAt ?? now,
      updatedAt: now,
    }
    await saveDevotion.mutateAsync(payload)
  }

  const displayDate = format(parseISO(selectedDate), 'EEEE, dd/MM/yyyy', { locale: vi })
  const isToday = selectedDate === todayStr()

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">{t('devotion.title', 'Tĩnh nguyện')}</h1>

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

      {/* Today's Bible Reading Plan */}
      {isToday && todayBibleDay && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-semibold text-blue-800">
                {t('devotion.readingPlan', 'Kế hoạch đọc Kinh Thánh')} — Ngày {todayBibleDay.dayNumber}
              </span>
              {todayBibleDay.isCompleted && <Badge className="bg-green-100 text-green-800 text-xs">Đã đọc</Badge>}
            </div>
            {todayBibleDay.readings.map((r, i) => (
              <div key={i} className="text-sm text-blue-700">
                {r.book} {r.chapter}:{r.verseStart}{r.verseEnd ? `–${r.verseEnd}` : ''}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Bible Passages */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center justify-between">
            {t('devotion.passage', 'Đoạn Kinh Thánh')}
            <Button variant="outline" size="sm" onClick={addPassage}>
              <Plus className="h-3.5 w-3.5 mr-1" /> Thêm đoạn
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {form.passages.map((passage, idx) => (
            <div key={idx} className="border rounded-md p-3 space-y-2">
              <div className="grid grid-cols-4 gap-2">
                <div className="col-span-2">
                  <Label className="text-xs">Sách</Label>
                  <Input
                    value={passage.book}
                    onChange={e => updatePassage(idx, 'book', e.target.value)}
                    placeholder="Giăng"
                    className="h-8"
                  />
                </div>
                <div>
                  <Label className="text-xs">Chương</Label>
                  <Input
                    type="number" min={1}
                    value={passage.chapter}
                    onChange={e => updatePassage(idx, 'chapter', e.target.value)}
                    placeholder="3"
                    className="h-8"
                  />
                </div>
                <div>
                  <Label className="text-xs">Câu đầu</Label>
                  <Input
                    type="number" min={1}
                    value={passage.verseStart}
                    onChange={e => updatePassage(idx, 'verseStart', e.target.value)}
                    placeholder="16"
                    className="h-8"
                  />
                </div>
                <div>
                  <Label className="text-xs">Câu cuối</Label>
                  <Input
                    type="number" min={1}
                    value={passage.verseEnd}
                    onChange={e => updatePassage(idx, 'verseEnd', e.target.value)}
                    placeholder="21"
                    className="h-8"
                  />
                </div>
              </div>
              <div>
                <Label className="text-xs">Nội dung câu (tùy chọn)</Label>
                <Textarea
                  value={passage.text}
                  onChange={e => updatePassage(idx, 'text', e.target.value)}
                  placeholder="Nhập nội dung câu Kinh Thánh..."
                  rows={2}
                  className="text-sm"
                />
              </div>
              {form.passages.length > 1 && (
                <Button variant="ghost" size="sm" className="text-destructive h-7" onClick={() => removePassage(idx)}>
                  <Trash2 className="h-3.5 w-3.5 mr-1" /> Xóa đoạn này
                </Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Reflection Fields */}
      <Card>
        <CardContent className="pt-4 space-y-4">
          <div>
            <Label>{t('devotion.bibleTeaches', 'Kinh Thánh dạy gì?')}</Label>
            <Textarea
              value={form.bibleTeaches}
              onChange={e => setForm(f => ({ ...f, bibleTeaches: e.target.value }))}
              placeholder="Đoạn Kinh Thánh này dạy gì về Đức Chúa Trời, con người, tội lỗi..."
              rows={3}
            />
          </div>
          <div>
            <Label>{t('devotion.lessonLearned', 'Bài học rút ra')}</Label>
            <Textarea
              value={form.lessonLearned}
              onChange={e => setForm(f => ({ ...f, lessonLearned: e.target.value }))}
              placeholder="Bài học bạn học được từ đoạn này..."
              rows={3}
            />
          </div>
          <div>
            <Label>{t('devotion.application', 'Áp dụng vào cuộc sống')}</Label>
            <Textarea
              value={form.application}
              onChange={e => setForm(f => ({ ...f, application: e.target.value }))}
              placeholder="Bạn sẽ áp dụng bài học này như thế nào hôm nay..."
              rows={3}
            />
          </div>
          <div>
            <Label>{t('devotion.prayer', 'Điểm cầu nguyện')}</Label>
            <Textarea
              value={form.prayerPoints}
              onChange={e => setForm(f => ({ ...f, prayerPoints: e.target.value }))}
              placeholder="Những điều bạn muốn cầu nguyện..."
              rows={2}
            />
          </div>
          <div>
            <Label>{t('devotion.memorize', 'Câu ghi nhớ')}</Label>
            <Input
              value={form.memorizeVerse}
              onChange={e => setForm(f => ({ ...f, memorizeVerse: e.target.value }))}
              placeholder="Câu Kinh Thánh bạn muốn ghi nhớ hôm nay..."
            />
          </div>
          <div>
            <Label>Tâm trạng tĩnh nguyện</Label>
            <Select
              value={form.mood}
              onValueChange={v => setForm(f => ({ ...f, mood: v }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn tâm trạng..." />
              </SelectTrigger>
              <SelectContent>
                {MOOD_OPTIONS.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Button className="w-full" onClick={handleSave} disabled={saveDevotion.isPending}>
        {saveDevotion.isPending ? 'Đang lưu...' : t('common.save')}
      </Button>
    </div>
  )
}

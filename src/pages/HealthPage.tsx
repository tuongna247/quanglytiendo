import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { nanoid } from 'nanoid'
import { Trash2 } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { useCurrentUserId } from '@/store/useAuthStore'
import {
  useWeightLogs, useCreateWeight, useDeleteWeight,
  useExerciseSessions, useCreateExercise, useDeleteExercise,
  useHealthGoal, useSaveHealthGoal,
  useBodyCheckIn, useSaveBodyCheckIn,
} from '@/hooks/useHealth'
import { todayStr, nowISO, formatDate } from '@/lib/utils'
import type { ExerciseType, IntensityLevel } from '@/types/health.types'

function calcBMI(weightKg: number, heightCm: number): number {
  const hm = heightCm / 100
  return weightKg / (hm * hm)
}

function bmiCategory(bmi: number): { label: string; color: string } {
  if (bmi < 18.5) return { label: 'Gầy', color: 'text-blue-600' }
  if (bmi < 25) return { label: 'Bình thường', color: 'text-green-600' }
  if (bmi < 30) return { label: 'Thừa cân', color: 'text-yellow-600' }
  return { label: 'Béo phì', color: 'text-red-600' }
}

const LEVEL_LABELS = ['', 'Rất thấp', 'Thấp', 'Trung bình', 'Cao', 'Rất cao']

export default function HealthPage() {
  const { t } = useTranslation()
  const userId = useCurrentUserId()
  const today = todayStr()

  // Weight
  const { data: weightLogs = [] } = useWeightLogs()
  const createWeight = useCreateWeight()
  const deleteWeight = useDeleteWeight()
  const [wForm, setWForm] = useState({ date: today, weightKg: '', notes: '' })

  // Exercise
  const { data: exercises = [] } = useExerciseSessions()
  const createExercise = useCreateExercise()
  const deleteExercise = useDeleteExercise()
  const [eForm, setEForm] = useState({
    date: today, type: 'cardio' as ExerciseType,
    name: '', durationMinutes: '', intensity: 'moderate' as IntensityLevel,
    caloriesBurned: '', notes: '',
  })

  // Health Goal
  const { data: goal } = useHealthGoal()
  const saveGoal = useSaveHealthGoal()
  const [gForm, setGForm] = useState({
    heightCm: goal?.heightCm?.toString() ?? '',
    startWeightKg: goal?.startWeightKg?.toString() ?? '',
    targetWeightKg: goal?.targetWeightKg?.toString() ?? '',
    targetDate: goal?.targetDate ?? '',
    weeklyExerciseDays: goal?.weeklyExerciseDays?.toString() ?? '',
  })

  // Body Check-In
  const { data: checkIn } = useBodyCheckIn(today)
  const saveCheckIn = useSaveBodyCheckIn()
  const [cForm, setCForm] = useState({
    energyLevel: checkIn?.energyLevel ?? 3,
    moodLevel: checkIn?.moodLevel ?? 3,
    sleepQuality: checkIn?.sleepQuality ?? 3,
    sleepHours: checkIn?.sleepHours?.toString() ?? '',
    stressLevel: checkIn?.stressLevel ?? 3,
    muscleSoreness: checkIn?.muscleSoreness ?? false,
    generalNotes: checkIn?.generalNotes ?? '',
  })

  async function handleAddWeight() {
    if (!wForm.weightKg) return
    await createWeight.mutateAsync({
      id: nanoid(), userId,
      date: wForm.date,
      weightKg: parseFloat(wForm.weightKg),
      notes: wForm.notes || undefined,
      createdAt: nowISO(),
    })
    setWForm(f => ({ ...f, weightKg: '', notes: '' }))
  }

  async function handleAddExercise() {
    if (!eForm.name || !eForm.durationMinutes) return
    const now = nowISO()
    await createExercise.mutateAsync({
      id: nanoid(), userId,
      date: eForm.date,
      type: eForm.type,
      name: eForm.name,
      durationMinutes: parseInt(eForm.durationMinutes),
      intensity: eForm.intensity,
      caloriesBurned: eForm.caloriesBurned ? parseInt(eForm.caloriesBurned) : undefined,
      notes: eForm.notes || undefined,
      createdAt: now, updatedAt: now,
    })
    setEForm(f => ({ ...f, name: '', durationMinutes: '', caloriesBurned: '', notes: '' }))
  }

  async function handleSaveGoal() {
    if (!gForm.heightCm || !gForm.startWeightKg || !gForm.targetWeightKg) return
    const now = nowISO()
    await saveGoal.mutateAsync({
      id: goal?.id ?? nanoid(), userId,
      startDate: goal?.startDate ?? today,
      targetDate: gForm.targetDate || undefined,
      startWeightKg: parseFloat(gForm.startWeightKg),
      targetWeightKg: parseFloat(gForm.targetWeightKg),
      heightCm: parseFloat(gForm.heightCm),
      weeklyExerciseDays: gForm.weeklyExerciseDays ? parseInt(gForm.weeklyExerciseDays) : undefined,
      isActive: true,
      createdAt: goal?.createdAt ?? now,
      updatedAt: now,
    })
  }

  async function handleSaveCheckIn() {
    const now = nowISO()
    await saveCheckIn.mutateAsync({
      id: checkIn?.id ?? nanoid(), userId, date: today,
      energyLevel: cForm.energyLevel as 1|2|3|4|5,
      moodLevel: cForm.moodLevel as 1|2|3|4|5,
      sleepQuality: cForm.sleepQuality as 1|2|3|4|5,
      sleepHours: cForm.sleepHours ? parseFloat(cForm.sleepHours) : undefined,
      stressLevel: cForm.stressLevel as 1|2|3|4|5,
      muscleSoreness: cForm.muscleSoreness,
      generalNotes: cForm.generalNotes || undefined,
      createdAt: checkIn?.createdAt ?? now,
      updatedAt: now,
    })
  }

  const sortedWeightLogs = [...weightLogs].sort((a, b) => a.date.localeCompare(b.date))
  const latestWeight = sortedWeightLogs[sortedWeightLogs.length - 1]
  const sortedExercises = [...exercises].sort((a, b) => b.date.localeCompare(a.date))

  const currentBmi = latestWeight && goal?.heightCm
    ? calcBMI(latestWeight.weightKg, goal.heightCm)
    : null
  const bmiInfo = currentBmi ? bmiCategory(currentBmi) : null

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{t('health.title', 'Sức khỏe')}</h1>

      <Tabs defaultValue="weight">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="weight">Cân nặng</TabsTrigger>
          <TabsTrigger value="exercise">Tập luyện</TabsTrigger>
          <TabsTrigger value="bmi">BMI & Mục tiêu</TabsTrigger>
          <TabsTrigger value="checkin">Lắng nghe cơ thể</TabsTrigger>
        </TabsList>

        {/* Weight Tab */}
        <TabsContent value="weight" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Ghi nhận cân nặng</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3 mb-3">
                <div>
                  <Label>Ngày</Label>
                  <Input type="date" value={wForm.date} onChange={e => setWForm(f => ({ ...f, date: e.target.value }))} />
                </div>
                <div>
                  <Label>Cân nặng (kg) *</Label>
                  <Input type="number" step="0.1" value={wForm.weightKg} onChange={e => setWForm(f => ({ ...f, weightKg: e.target.value }))} placeholder="65.5" />
                </div>
                <div>
                  <Label>Ghi chú</Label>
                  <Input value={wForm.notes} onChange={e => setWForm(f => ({ ...f, notes: e.target.value }))} placeholder="Tùy chọn" />
                </div>
              </div>
              <Button onClick={handleAddWeight} disabled={!wForm.weightKg}>Lưu</Button>
            </CardContent>
          </Card>

          {sortedWeightLogs.length > 1 && (
            <Card>
              <CardHeader><CardTitle className="text-base">Biểu đồ cân nặng</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={sortedWeightLogs.map(l => ({ date: l.date.slice(5), weight: l.weightKg }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis domain={['auto', 'auto']} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="weight" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader><CardTitle className="text-base">Lịch sử cân nặng</CardTitle></CardHeader>
            <CardContent>
              {weightLogs.length === 0 ? (
                <p className="text-muted-foreground text-sm">Chưa có dữ liệu.</p>
              ) : (
                <div className="space-y-2">
                  {[...weightLogs].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 10).map(log => (
                    <div key={log.id} className="flex items-center justify-between py-1 border-b last:border-0">
                      <span className="text-sm text-muted-foreground">{formatDate(log.date)}</span>
                      <span className="font-semibold">{log.weightKg} kg</span>
                      {log.notes && <span className="text-xs text-muted-foreground">{log.notes}</span>}
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteWeight.mutate(log.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Exercise Tab */}
        <TabsContent value="exercise" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Ghi nhận buổi tập</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Ngày</Label>
                  <Input type="date" value={eForm.date} onChange={e => setEForm(f => ({ ...f, date: e.target.value }))} />
                </div>
                <div>
                  <Label>Loại</Label>
                  <Select value={eForm.type} onValueChange={v => setEForm(f => ({ ...f, type: v as ExerciseType }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cardio">Cardio</SelectItem>
                      <SelectItem value="strength">Sức mạnh</SelectItem>
                      <SelectItem value="flexibility">Linh hoạt</SelectItem>
                      <SelectItem value="sports">Thể thao</SelectItem>
                      <SelectItem value="other">Khác</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Tên bài tập *</Label>
                  <Input value={eForm.name} onChange={e => setEForm(f => ({ ...f, name: e.target.value }))} placeholder="Chạy bộ, Yoga..." />
                </div>
                <div>
                  <Label>Thời gian (phút) *</Label>
                  <Input type="number" value={eForm.durationMinutes} onChange={e => setEForm(f => ({ ...f, durationMinutes: e.target.value }))} placeholder="30" />
                </div>
                <div>
                  <Label>Cường độ</Label>
                  <Select value={eForm.intensity} onValueChange={v => setEForm(f => ({ ...f, intensity: v as IntensityLevel }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Nhẹ</SelectItem>
                      <SelectItem value="moderate">Vừa</SelectItem>
                      <SelectItem value="vigorous">Mạnh</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Calo đốt</Label>
                  <Input type="number" value={eForm.caloriesBurned} onChange={e => setEForm(f => ({ ...f, caloriesBurned: e.target.value }))} placeholder="200" />
                </div>
              </div>
              <div>
                <Label>Ghi chú</Label>
                <Input value={eForm.notes} onChange={e => setEForm(f => ({ ...f, notes: e.target.value }))} placeholder="Tùy chọn" />
              </div>
              <Button onClick={handleAddExercise} disabled={!eForm.name || !eForm.durationMinutes}>Lưu</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Lịch sử tập luyện</CardTitle></CardHeader>
            <CardContent>
              {sortedExercises.length === 0 ? (
                <p className="text-muted-foreground text-sm">Chưa có dữ liệu.</p>
              ) : (
                <div className="space-y-2">
                  {sortedExercises.slice(0, 10).map(s => (
                    <div key={s.id} className="flex items-center justify-between py-1 border-b last:border-0">
                      <div>
                        <div className="text-sm font-medium">{s.name}</div>
                        <div className="text-xs text-muted-foreground">{formatDate(s.date)} · {s.durationMinutes} phút · {s.type}</div>
                      </div>
                      {s.caloriesBurned && <span className="text-xs text-orange-600">{s.caloriesBurned} kcal</span>}
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteExercise.mutate(s.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* BMI & Goal Tab */}
        <TabsContent value="bmi" className="space-y-4">
          {currentBmi && bmiInfo && (
            <Card>
              <CardHeader><CardTitle className="text-base">Chỉ số BMI hiện tại</CardTitle></CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="text-4xl font-bold">{currentBmi.toFixed(1)}</div>
                  <div>
                    <div className={`text-lg font-semibold ${bmiInfo.color}`}>{bmiInfo.label}</div>
                    <div className="text-xs text-muted-foreground">Từ cân nặng {latestWeight.weightKg} kg ngày {formatDate(latestWeight.date)}</div>
                  </div>
                </div>
                {goal && (
                  <div className="mt-3">
                    <div className="text-sm text-muted-foreground mb-1">
                      Tiến độ: {latestWeight.weightKg} kg / {goal.targetWeightKg} kg
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all"
                        style={{
                          width: `${Math.min(100, Math.max(0, ((goal.startWeightKg - latestWeight.weightKg) / (goal.startWeightKg - goal.targetWeightKg)) * 100))}%`
                        }}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader><CardTitle className="text-base">Mục tiêu sức khỏe</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Chiều cao (cm) *</Label>
                  <Input type="number" value={gForm.heightCm} onChange={e => setGForm(f => ({ ...f, heightCm: e.target.value }))} placeholder="170" />
                </div>
                <div>
                  <Label>Cân nặng hiện tại (kg) *</Label>
                  <Input type="number" step="0.1" value={gForm.startWeightKg} onChange={e => setGForm(f => ({ ...f, startWeightKg: e.target.value }))} placeholder="70" />
                </div>
                <div>
                  <Label>Cân nặng mục tiêu (kg) *</Label>
                  <Input type="number" step="0.1" value={gForm.targetWeightKg} onChange={e => setGForm(f => ({ ...f, targetWeightKg: e.target.value }))} placeholder="65" />
                </div>
                <div>
                  <Label>Ngày đạt mục tiêu</Label>
                  <Input type="date" value={gForm.targetDate} onChange={e => setGForm(f => ({ ...f, targetDate: e.target.value }))} />
                </div>
                <div>
                  <Label>Ngày tập/tuần</Label>
                  <Input type="number" min={1} max={7} value={gForm.weeklyExerciseDays} onChange={e => setGForm(f => ({ ...f, weeklyExerciseDays: e.target.value }))} placeholder="3" />
                </div>
              </div>
              <Button onClick={handleSaveGoal} disabled={!gForm.heightCm || !gForm.startWeightKg || !gForm.targetWeightKg}>
                {t('common.save')}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Thang đo BMI</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-1 text-sm">
                <div className="flex gap-2"><span className="text-blue-600 font-medium">Gầy</span><span className="text-muted-foreground">BMI &lt; 18.5</span></div>
                <div className="flex gap-2"><span className="text-green-600 font-medium">Bình thường</span><span className="text-muted-foreground">18.5 – 24.9</span></div>
                <div className="flex gap-2"><span className="text-yellow-600 font-medium">Thừa cân</span><span className="text-muted-foreground">25 – 29.9</span></div>
                <div className="flex gap-2"><span className="text-red-600 font-medium">Béo phì</span><span className="text-muted-foreground">≥ 30</span></div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Body Check-In Tab */}
        <TabsContent value="checkin" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Check-in hôm nay ({formatDate(today)})</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {(['energyLevel', 'moodLevel', 'sleepQuality', 'stressLevel'] as const).map(field => {
                const labelMap: Record<string, string> = {
                  energyLevel: t('health.energy', 'Năng lượng'),
                  moodLevel: t('health.mood', 'Tâm trạng'),
                  sleepQuality: t('health.sleep', 'Chất lượng giấc ngủ'),
                  stressLevel: t('health.stress', 'Mức căng thẳng'),
                }
                return (
                  <div key={field}>
                    <Label className="mb-2 block">{labelMap[field]}: <span className="font-semibold">{LEVEL_LABELS[cForm[field]]}</span></Label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map(v => (
                        <button
                          key={v}
                          type="button"
                          onClick={() => setCForm(f => ({ ...f, [field]: v }))}
                          className={`w-9 h-9 rounded-full border-2 font-semibold text-sm transition-colors ${
                            cForm[field] === v ? 'bg-blue-600 text-white border-blue-600' : 'border-muted-foreground/30 hover:border-blue-400'
                          }`}
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>
                )
              })}

              <div>
                <Label>Số giờ ngủ</Label>
                <Input
                  type="number" step="0.5" min={0} max={24}
                  value={cForm.sleepHours}
                  onChange={e => setCForm(f => ({ ...f, sleepHours: e.target.value }))}
                  placeholder="7.5"
                  className="w-32"
                />
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="soreness"
                  checked={cForm.muscleSoreness}
                  onCheckedChange={v => setCForm(f => ({ ...f, muscleSoreness: !!v }))}
                />
                <Label htmlFor="soreness">Đau nhức cơ bắp</Label>
              </div>

              <div>
                <Label>Ghi chú chung</Label>
                <Textarea
                  value={cForm.generalNotes}
                  onChange={e => setCForm(f => ({ ...f, generalNotes: e.target.value }))}
                  placeholder="Cảm nhận hôm nay..."
                  rows={3}
                />
              </div>

              <Button onClick={handleSaveCheckIn}>{t('common.save')}</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export type ExerciseType = 'cardio' | 'strength' | 'flexibility' | 'sports' | 'other'
export type IntensityLevel = 'light' | 'moderate' | 'vigorous'

export interface WeightLog {
  id: string
  userId: string
  date: string
  weightKg: number
  bodyFatPct?: number
  notes?: string
  createdAt: string
}

export interface ExerciseSession {
  id: string
  userId: string
  date: string
  type: ExerciseType
  name: string
  durationMinutes: number
  caloriesBurned?: number
  intensity: IntensityLevel
  notes?: string
  linkedPlannerItemId?: string
  createdAt: string
  updatedAt: string
}

export interface HealthGoal {
  id: string
  userId: string
  startDate: string
  targetDate?: string
  startWeightKg: number
  targetWeightKg: number
  heightCm: number
  dailyCalorieTarget?: number
  weeklyExerciseDays?: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface BodyCheckIn {
  id: string
  userId: string
  date: string
  energyLevel: 1 | 2 | 3 | 4 | 5
  moodLevel: 1 | 2 | 3 | 4 | 5
  sleepQuality: 1 | 2 | 3 | 4 | 5
  sleepHours?: number
  muscleSoreness: boolean
  soreAreas?: string[]
  painNotes?: string
  stressLevel: 1 | 2 | 3 | 4 | 5
  generalNotes?: string
  createdAt: string
  updatedAt: string
}

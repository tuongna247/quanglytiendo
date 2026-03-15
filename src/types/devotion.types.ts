export interface BiblePassage {
  book: string
  chapter: number
  verseStart: number
  verseEnd?: number
  text?: string
}

export interface DailyDevotion {
  id: string
  userId: string
  date: string
  passages: BiblePassage[]
  bibleTeaches: string
  lessonLearned: string
  application: string
  prayerPoints?: string
  memorizeVerse?: string
  godCharacter?: string
  sinToAvoid?: string
  promiseToClaim?: string
  mood?: 'grateful' | 'challenged' | 'peaceful' | 'struggling' | 'joyful'
  createdAt: string
  updatedAt: string
}

export interface BibleReadingPlan {
  id: string
  userId: string
  name: string
  totalDays: number
  startDate: string
  importedAt: string
}

export interface BibleReadingDay {
  id: string
  userId: string
  planId: string
  dayNumber: number
  scheduledDate: string
  readings: BiblePassage[]
  isCompleted: boolean
  completedAt?: string
  linkedDevotionId?: string
}

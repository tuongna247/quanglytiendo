# Plan: App Quản Lý Tiến Độ (Task, Finance & Health Manager)

## Context

Building a greenfield web application from scratch based on CLAUDE.md requirements. The app combines Google Calendar-style event scheduling, step-by-step task management, daily planning, personal income/expense tracking, a health module for exercise tracking and weight-loss suggestions, **and a multi-user authentication system so each user has their own private data**. The project directory is currently empty (only CLAUDE.md exists). User wants React + TypeScript with Vietnamese/English i18n support.

---

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **UI**: Tailwind CSS + shadcn/ui
- **State**: Zustand (UI state) + TanStack React Query (data fetching/caching)
- **Persistence**: Dexie.js (IndexedDB wrapper) — offline-first, no backend needed
- **Forms**: react-hook-form + zod
- **i18n**: i18next + react-i18next (vi / en)
- **Drag & Drop**: dnd-kit (for task steps reorder + planner reorder)
- **Charts**: Recharts (finance bar/line charts)
- **Date utils**: date-fns (with vi locale)
- **IDs**: nanoid
- **Auth**: Local multi-user auth stored in IndexedDB — bcrypt-js for password hashing, session token in `sessionStorage`

---

## Project Structure

```text
src/
├── assets/
├── components/
│   ├── ui/                    # shadcn/ui generated components
│   ├── layout/
│   │   ├── AppShell.tsx       # Sidebar + TopBar + <Outlet>
│   │   ├── Sidebar.tsx
│   │   └── TopBar.tsx
│   ├── auth/
│   │   ├── LoginPage.tsx      # Login form
│   │   ├── RegisterPage.tsx   # Register form
│   │   └── ProtectedRoute.tsx # Redirect to /login if no session
│   ├── calendar/
│   │   ├── CalendarGrid.tsx   # Monthly view
│   │   ├── WeekView.tsx       # Weekly column layout
│   │   ├── DayView.tsx        # Hourly timeline
│   │   ├── EventCard.tsx
│   │   ├── EventModal.tsx
│   │   └── MiniCalendar.tsx   # Sidebar date picker
│   ├── tasks/
│   │   ├── TaskList.tsx
│   │   ├── TaskCard.tsx
│   │   ├── TaskModal.tsx
│   │   ├── StepList.tsx       # Ordered sub-steps with dnd-kit
│   │   └── TaskKanban.tsx
│   ├── finance/
│   │   ├── BalanceCard.tsx
│   │   ├── TransactionList.tsx
│   │   ├── TransactionModal.tsx
│   │   └── FinanceChart.tsx
│   ├── planner/
│   │   ├── DailyPlanner.tsx
│   │   └── PlannerItem.tsx
│   ├── health/
│   │   ├── WeightChart.tsx        # Line chart of weight over time
│   │   ├── WeightLogModal.tsx     # Log today's weight
│   │   ├── ExerciseList.tsx       # Exercise session history
│   │   ├── ExerciseModal.tsx      # Log exercise session
│   │   ├── HealthGoalCard.tsx     # Goal progress (current vs target weight)
│   │   ├── BMICard.tsx            # BMI indicator with category
│   │   ├── SuggestionPanel.tsx    # Rule-based weight-loss suggestions
│   │   ├── BodyCheckInModal.tsx   # Daily body listening check-in form
│   │   └── BodyCheckInCard.tsx    # Display today's check-in summary
│   ├── journal/
│   │   ├── DailyNotes.tsx         # Date-by-date notes view
│   │   ├── NoteEditor.tsx         # Rich text note editor for a day
│   │   └── NoteDatePicker.tsx     # Navigate between dates
│   └── devotion/
│       ├── DevotionModal.tsx          # Log daily Bible reading + lesson
│       ├── DevotionCard.tsx           # Show today's devotion summary
│       ├── DevotionHistory.tsx        # Browse past devotions by date
│       ├── BiblePassageInput.tsx      # Book + chapter + verse picker (autocomplete)
│       ├── ReadingPlanImporter.tsx    # Import XML reading plan file
│       ├── ReadingPlanProgress.tsx    # 365-day progress list + progress bar
│       └── TodaysReadingCard.tsx      # Today's scheduled readings from the plan
├── pages/
│   ├── DashboardPage.tsx
│   ├── CalendarPage.tsx
│   ├── TasksPage.tsx
│   ├── FinancePage.tsx
│   ├── PlannerPage.tsx
│   ├── HealthPage.tsx
│   ├── JournalPage.tsx
│   ├── DevotionPage.tsx
│   └── SettingsPage.tsx
├── store/
│   ├── useAuthStore.ts       # current user session
│   ├── useEventStore.ts
│   ├── useTaskStore.ts
│   ├── useFinanceStore.ts
│   ├── usePlannerStore.ts
│   ├── useHealthStore.ts
│   ├── useJournalStore.ts
│   └── useDevotionStore.ts
├── db/
│   ├── database.ts           # Dexie schema (includes users table)
│   ├── userRepository.ts
│   ├── eventRepository.ts
│   ├── taskRepository.ts
│   ├── financeRepository.ts
│   ├── plannerRepository.ts
│   ├── healthRepository.ts
│   ├── journalRepository.ts
│   ├── devotionRepository.ts
│   └── bibleReadingPlanRepository.ts
├── hooks/
│   ├── useEvents.ts
│   ├── useTasks.ts
│   ├── useFinance.ts
│   ├── usePlanner.ts
│   ├── useHealth.ts
│   ├── useJournal.ts
│   └── useDevotion.ts
├── types/
│   ├── event.types.ts
│   ├── task.types.ts
│   ├── finance.types.ts
│   ├── planner.types.ts
│   ├── health.types.ts
│   ├── journal.types.ts
│   └── devotion.types.ts
├── i18n/
│   ├── index.ts              # i18next config
│   ├── locales/vi.json       # Vietnamese strings
│   └── locales/en.json       # English strings
├── lib/
│   ├── utils.ts              # cn(), formatCurrency (VND)
│   ├── dateUtils.ts          # recurrence expansion, range helpers
│   ├── healthSuggestions.ts       # rule-based suggestion engine
│   ├── bibleReadingPlanParser.ts  # XML → BibleReadingDay[] parser
│   ├── bibleBooks.ts              # list of 66 books (vi + en names)
│   └── constants.ts               # categories, priorities, colors
├── router/
│   └── AppRouter.tsx
├── App.tsx
├── main.tsx
└── index.css
```

---

## Core Data Models

### User (Auth)

```typescript
interface User {
  id: string;
  username: string;
  displayName: string;
  passwordHash: string;    // bcryptjs hash
  avatarColor?: string;    // random color for avatar initials
  createdAt: string;
}

// Session stored in sessionStorage (cleared on browser close)
interface Session {
  userId: string;
  username: string;
  displayName: string;
  expiresAt: string;       // ISO datetime, 7-day rolling expiry
}
```

> All other records include a `userId` field. Queries always filter by `currentUser.id`.

### CalendarEvent

```typescript
interface CalendarEvent {
  id: string;
  userId: string;
  title: string;
  description?: string;
  startAt: string;        // ISO 8601
  endAt: string;
  allDay: boolean;
  color: string;
  category: string;
  recurrence: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  recurrenceEndDate?: string;
  reminderMinutes?: number;
  linkedTaskId?: string;
  createdAt: string;
  updatedAt: string;
}
```

### Task

```typescript
interface TaskStep {
  id: string;
  order: number;
  title: string;
  description?: string;
  isDone: boolean;
  completedAt?: string;
}

interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'done' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  dueDate?: string;
  scheduledDate?: string;
  estimatedMinutes?: number;
  steps: TaskStep[];       // ordered how-to steps
  tags: string[];
  linkedEventId?: string;
  createdAt: string;
  updatedAt: string;
}
```

### Transaction

```typescript
interface Transaction {
  id: string;
  userId: string;
  type: 'income' | 'expense';
  amount: number;          // VND
  category: string;
  description: string;
  date: string;            // YYYY-MM-DD
  paymentMethod?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}
```

### PlannerItem

```typescript
interface PlannerItem {
  id: string;
  userId: string;
  date: string;            // YYYY-MM-DD
  order: number;           // execution order for that day
  title: string;
  notes?: string;
  isDone: boolean;
  completedAt?: string;
  estimatedMinutes?: number;
  linkedTaskId?: string;
  linkedEventId?: string;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
}
```

### WeightLog

```typescript
interface WeightLog {
  id: string;
  userId: string;
  date: string;          // YYYY-MM-DD
  weightKg: number;      // e.g. 72.5
  bodyFatPct?: number;   // optional body fat %
  notes?: string;
  createdAt: string;
}
```

### ExerciseSession

```typescript
type ExerciseType = 'cardio' | 'strength' | 'flexibility' | 'sports' | 'other';
type IntensityLevel = 'light' | 'moderate' | 'vigorous';

interface ExerciseSession {
  id: string;
  userId: string;
  date: string;              // YYYY-MM-DD
  type: ExerciseType;
  name: string;              // e.g. "Chạy bộ", "Gym", "Bơi lội"
  durationMinutes: number;
  caloriesBurned?: number;   // estimated kcal
  intensity: IntensityLevel;
  notes?: string;
  linkedPlannerItemId?: string;
  createdAt: string;
  updatedAt: string;
}
```

### BodyCheckIn ("Lắng nghe cơ thể")

```typescript
type EnergyLevel = 1 | 2 | 3 | 4 | 5;   // 1=kiệt sức, 5=tràn đầy năng lượng
type MoodLevel   = 1 | 2 | 3 | 4 | 5;   // 1=rất tệ, 5=rất tốt
type SleepQuality = 1 | 2 | 3 | 4 | 5;  // 1=mất ngủ, 5=ngủ rất ngon

interface BodyCheckIn {
  id: string;
  userId: string;
  date: string;               // YYYY-MM-DD — one entry per day
  energyLevel: EnergyLevel;
  moodLevel: MoodLevel;
  sleepQuality: SleepQuality;
  sleepHours?: number;        // hours slept last night
  muscleSoreness: boolean;    // đau nhức cơ bắp
  soreAreas?: string[];       // e.g. ['legs', 'shoulders']
  painNotes?: string;         // free text about pain / discomfort
  stressLevel: 1 | 2 | 3 | 4 | 5;
  generalNotes?: string;      // how body feels overall
  createdAt: string;
  updatedAt: string;
}
```

### DailyNote (Notes date by date)

```typescript
interface DailyNote {
  id: string;
  userId: string;
  date: string;           // YYYY-MM-DD — one note doc per day
  content: string;        // markdown/plain text note content
  todoItems: NoteTodo[];  // inline todo list for this day
  createdAt: string;
  updatedAt: string;
}

interface NoteTodo {
  id: string;
  text: string;
  isDone: boolean;
  completedAt?: string;
}
```

### BibleReadingPlan (Kế hoạch đọc Kinh Thánh 1 năm)

```typescript
// Imported from XML file — one plan per user (can be replaced)
interface BibleReadingPlan {
  id: string;
  userId: string;
  name: string;           // e.g. "Chronological Bible Plan 2026"
  totalDays: number;      // usually 365
  startDate: string;      // YYYY-MM-DD — day 1 of the plan
  importedAt: string;
}

// One record per day of the plan (365 records after import)
interface BibleReadingDay {
  id: string;
  userId: string;
  planId: string;
  dayNumber: number;      // 1–365
  scheduledDate: string;  // YYYY-MM-DD (startDate + dayNumber - 1)
  readings: BiblePassage[]; // passages to read that day (from XML)
  isCompleted: boolean;
  completedAt?: string;
  linkedDevotionId?: string; // if user wrote a devotion for this day
}
```

**XML Import format expected** (common bible plan XML schema):

```xml
<ReadingPlan name="One Year Bible" year="2026">
  <Day number="1" date="2026-01-01">
    <Reading book="Genesis" chapter="1" verseStart="1" verseEnd="31"/>
    <Reading book="Matthew" chapter="1" verseStart="1" verseEnd="25"/>
  </Day>
  ...
</ReadingPlan>
```

Parser: `src/lib/bibleReadingPlanParser.ts` — reads XML via `DOMParser`, maps to `BibleReadingDay[]`, bulk-inserts via Dexie transaction.

### DailyDevotion (Tĩnh nguyện hàng ngày)

```typescript
interface BiblePassage {
  book: string;        // e.g. "John", "Thi Thiên", "Rô-ma"
  chapter: number;
  verseStart: number;
  verseEnd?: number;   // optional end verse for a range
  text?: string;       // optional: paste the verse text
}

interface DailyDevotion {
  id: string;
  userId: string;
  date: string;                    // YYYY-MM-DD — one devotion per day
  passages: BiblePassage[];        // can log multiple passages

  // What the Bible teaches — structured reflection
  bibleTeaches: string;            // "Kinh Thánh dạy gì?" — core truth from the passage
  lessonLearned: string;           // "Bạn học được gì?" — personal takeaway
  application: string;             // "Áp dụng thế nào?" — concrete action for today
  prayerPoints?: string;           // Prayer requests / thanksgiving
  memorizeVerse?: string;          // A verse to memorize from today's reading

  // Reflection prompts (optional deeper journaling)
  godCharacter?: string;           // What does this passage reveal about God's character?
  sinToAvoid?: string;             // Any sin or warning highlighted?
  promiseToClain?: string;         // Any promise from God to hold onto?

  mood?: 'grateful' | 'challenged' | 'peaceful' | 'struggling' | 'joyful';
  createdAt: string;
  updatedAt: string;
}
```

### HealthGoal

```typescript
interface HealthGoal {
  id: string;
  userId: string;
  startDate: string;
  targetDate?: string;
  startWeightKg: number;
  targetWeightKg: number;
  heightCm: number;            // for BMI calculation
  dailyCalorieTarget?: number;
  weeklyExerciseDays?: number; // target exercise days per week
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
```

---

## Dexie Schema (IndexedDB)

```typescript
// src/db/database.ts
db.version(1).stores({
  users:            '&id, &username',
  events:           '&id, userId, startAt, endAt, category',
  tasks:            '&id, userId, status, priority, dueDate, scheduledDate',
  transactions:     '&id, userId, type, date, category',
  plannerItems:     '&id, userId, date, order, isDone',
  weightLogs:       '&id, userId, date',
  exerciseSessions: '&id, userId, date, type',
  healthGoals:      '&id, userId, isActive',
  bodyCheckIns:     '&id, userId, &[userId+date]',
  dailyNotes:       '&id, userId, &[userId+date]',
  dailyDevotions:      '&id, userId, &[userId+date]',
  bibleReadingPlans:   '&id, userId',
  bibleReadingDays:    '&id, planId, userId, dayNumber, scheduledDate, isCompleted',
});
```

---

## Pages & Routes

| Route | Page | Description |
| --- | --- | --- |
| `/login` | Login | Login / Register — redirects to `/` on success |
| `/` | Dashboard | Today's agenda, balance summary, task progress |
| `/calendar` | Calendar | Month/Week/Day view, event CRUD |
| `/tasks` | Tasks | List + Kanban, task detail with steps |
| `/finance` | Finance | Income/expense log, charts, balance cards |
| `/planner` | Daily Planner | Ordered daily to-do list, drag-to-reorder |
| `/health` | Health | Weight log, exercise history, BMI, goal, body check-in, suggestions |
| `/journal` | Journal | Date-by-date notes + inline todo list |
| `/devotion` | Devotion | Daily Bible reading, lesson learned, prayer points, streak |
| `/settings` | Settings | Categories, currency, theme, language toggle |

---

## i18n Setup

- Use `i18next` + `react-i18next`
- Default language: Vietnamese (`vi`)
- Language switcher in TopBar / Settings page
- Translation files: `src/i18n/locales/vi.json` and `en.json`
- Vietnamese categories: Ăn uống, Di chuyển, Tiền lương, Thuê nhà, Mua sắm, Y tế, Giáo dục, Giải trí
- Currency: `Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })`
- Date locale: `date-fns/locale/vi` for calendar labels

---

## Implementation Phases

### Phase 1 — Bootstrap

1. `npm create vite@latest . -- --template react-ts` in project dir
2. Install all deps: tailwind, shadcn/ui, zustand, react-query, dexie, nanoid, date-fns, recharts, dnd-kit, react-hook-form, zod, i18next, react-i18next, bcryptjs
3. Configure tailwind + shadcn/ui
4. Set up i18n with vi/en JSON files
5. Build AppShell + Sidebar + TopBar + AppRouter with stub pages

### Phase 2 — Data Layer

1. Dexie schema in `src/db/database.ts`
2. Repository classes (CRUD + queries) for all 8 tables
3. Zustand stores + React Query hooks

### Phase 3 — Authentication

1. `RegisterPage` — username, displayName, password (bcryptjs hash, stored in IndexedDB)
2. `LoginPage` — verify password hash, write session to `sessionStorage`
3. `ProtectedRoute` — redirects to `/login` if no valid session
4. `useAuthStore` — holds current user, logout clears session

### Phase 4 — Finance Module (simplest, validates the pattern)

1. TransactionModal (react-hook-form + zod)
2. TransactionList with filters
3. BalanceCard with period switching
4. FinanceChart (Recharts bar chart)

### Phase 5 — Task Management

1. TaskModal with StepList (dnd-kit sortable steps)
2. TaskCard + TaskList with filters
3. TaskKanban (drag between status columns)

### Phase 6 — Calendar (most complex)

1. MiniCalendar (sidebar)
2. CalendarGrid (monthly)
3. WeekView + DayView (time-slot grid)
4. EventModal with recurrence fields
5. Recurrence expansion in `dateUtils.ts`

### Phase 7 — Daily Planner

1. DailyPlanner with date navigation
2. PlannerItem with drag-to-reorder
3. "Add to planner" action in TaskModal/EventModal

### Phase 8 — Health Module

1. `HealthGoalCard` — set goal (target weight, height, deadline), computes BMI
2. `WeightLogModal` — log daily weight (kg) + optional body fat %
3. `WeightChart` — Recharts LineChart with weight trend + goal line overlay
4. `BMICard` — BMI indicator: Underweight / Normal / Overweight / Obese (color-coded)
5. `ExerciseModal` — log session: type, name, duration, intensity, calories burned
6. `ExerciseList` — filterable history with weekly/monthly totals
7. `BodyCheckInModal` — daily "lắng nghe cơ thể": energy (1-5), mood (1-5), sleep quality (1-5), sleep hours, muscle soreness + areas, stress level, pain notes
8. `BodyCheckInCard` — shows today's check-in summary with emoji indicators; links to suggestion engine
9. `SuggestionPanel` — rule-based engine (now also uses body check-in data)
10. Wire `HealthPage` with all widgets

### Phase 9 — Daily Devotion

1. `DevotionModal` — structured reflection form with sections:
   - **Đoạn Kinh Thánh** — passage picker (book + chapter + verses), optional verse text paste
   - **Kinh Thánh dạy gì?** (`bibleTeaches`) — core truth from the passage
   - **Tôi học được gì?** (`lessonLearned`) — personal takeaway
   - **Áp dụng thế nào?** (`application`) — one concrete action for today
   - **Thuộc lòng** (`memorizeVerse`) — optional verse to memorize
   - **Suy ngẫm sâu hơn** (collapsible): God's character revealed / sin to avoid / promise to claim
   - **Cầu nguyện** (`prayerPoints`) — prayer points & thanksgiving
   - **Tâm trạng** — mood tag (grateful / challenged / peaceful / struggling / joyful)
2. `BiblePassageInput` — book name autocomplete (66 books vi/en), chapter + verse number inputs, optional verse text paste
3. `DevotionCard` — shows today's devotion summary: passage ref, "Kinh Thánh dạy gì" snippet, lesson learned snippet, mood tag, memorize verse highlight
4. `DevotionHistory` — browse all past devotions by date; each entry shows passage + lesson; search by book name, keyword in lesson or bibleTeaches
5. Streak counter — computed from consecutive days with a devotion entry
6. **Bible Reading Plan** (see below) — import XML plan, show today's scheduled reading, mark as read
7. Dashboard widget: today's devotion status + streak badge

### Phase 9b — Bible Reading Plan (1-Year)

1. Import XML plan file via file input (`BibleReadingPlanImporter`)
2. Parse XML → store as `BibleReadingPlan` + `BibleReadingDay[]` records in IndexedDB
3. `ReadingPlanPage` (tab on DevotionPage) — list all 365 days, show checkmark for completed days
4. Today's scheduled readings auto-populate `DevotionModal`'s passage fields
5. Progress bar: X of 365 days completed

### Phase 10 — Journal (Notes date by date)

1. `DailyNotes` — date navigation (prev/next day, date picker), shows note for selected day
2. `NoteEditor` — plain text / markdown area for the day's note, auto-saves on blur
3. Inline `NoteTodo` list — add/check/delete todos directly on the note page
4. Dashboard widget: "today's note" preview + quick-add todo

### Phase 10 — Dashboard

1. Compose today's agenda (planner + calendar events merged)
2. Finance summary widget
3. Task progress ring widget
4. Today's body check-in prompt (if not yet done)
5. Today's note preview
6. Quick-add FABs

### Phase 11 — Polish

1. SettingsPage: categories, theme toggle, language switcher, export/import JSON
2. PWA config (vite-plugin-pwa) for offline install
3. Keyboard shortcuts (n = new event, t = new task, f = new transaction)
4. Responsive mobile layout (bottom tab nav)

---

## Body Check-In Rules (also fed into `SuggestionPanel`)

| Signal | Condition | Suggestion |
| --- | --- | --- |
| Low energy | energyLevel <= 2 for 2+ consecutive days | "Bạn đang mệt mỏi. Hãy nghỉ ngơi và uống đủ nước." |
| Poor sleep | sleepQuality <= 2 or sleepHours < 6 | "Giấc ngủ kém ảnh hưởng đến giảm cân. Hãy ngủ đủ 7-8 tiếng." |
| High stress | stressLevel >= 4 | "Căng thẳng cao làm chậm tiến trình. Thử thiền hoặc hít thở sâu." |
| Muscle soreness | muscleSoreness = true | "Cơ bắp đang đau nhức — hôm nay hãy tập nhẹ hoặc nghỉ phục hồi." |
| Great energy | energyLevel = 5 | "Hôm nay bạn tràn đầy năng lượng! Đây là lúc tốt để tập nặng hơn." |
| No check-in | No BodyCheckIn logged today | "Hãy lắng nghe cơ thể — điền check-in hôm nay!" |

## Health Suggestion Engine (`src/lib/healthSuggestions.ts`)

Rule-based function: `generateSuggestions(goal, weightLogs, exerciseSessions): Suggestion[]`

Each `Suggestion` has `{ id, type, priority, titleKey, messageKey, params }` — keys map to i18n strings.

| Rule | Condition | Suggestion |
| --- | --- | --- |
| Slow progress | Weight loss < 0.1 kg over last 7 days | "Bạn chưa giảm cân trong 7 ngày. Thử tăng cường độ tập luyện." |
| No exercise | No sessions logged in last 3 days | "Bạn chưa tập thể dục 3 ngày. Hãy đặt lịch tập hôm nay!" |
| BMI > 30 | Calculated BMI exceeds 30 | "Chỉ số BMI của bạn ở mức Béo phì. Hãy tham khảo bác sĩ." |
| On track | Weekly loss >= 0.5 kg | "Tuyệt vời! Bạn đang giảm đúng kế hoạch." |
| Missed weight log | No weight logged in last 2 days | "Bạn chưa cân hôm nay. Hãy cân để theo dõi tiến độ!" |
| Exercise goal met | Exercise days this week >= target | "Bạn đã đạt mục tiêu tập luyện tuần này!" |
| Near target | Within 2 kg of target weight | "Bạn sắp đạt mục tiêu rồi! Cố lên!" |

Suggestions render in `SuggestionPanel` as dismissible cards: green = positive, yellow = warning, red = alert.

---

## Critical Files

- `src/db/database.ts` — foundation, all tables/indexes defined here first
- `src/router/AppRouter.tsx` — all routes + ProtectedRoute wrapping
- `src/lib/dateUtils.ts` — recurrence logic, range queries used by calendar + planner
- `src/lib/healthSuggestions.ts` — suggestion rule engine, pure function (easy to test)
- `src/i18n/index.ts` — must be initialized before any component renders
- `src/types/health.types.ts` — `WeightLog`, `ExerciseSession`, `HealthGoal` models

---

## Verification Checklist

1. `npm run dev` → unauthenticated visits redirect to `/login`
2. Register user → login → all routes accessible, data scoped to that user
3. Create an Event → appears on CalendarGrid on correct date
4. Create a Task with 3 steps → steps persist after page refresh (IndexedDB)
5. Add income + expense → BalanceCard shows correct net total
6. Add planner items → drag to reorder → order persists after refresh
7. Set health goal → log weight → WeightChart shows data point + goal line
8. Log 0 exercise sessions for 3 days → SuggestionPanel shows "no exercise" warning
9. Complete body check-in with low energy (1) → SuggestionPanel shows rest suggestion
10. Open `/journal` → write a note for today → add 2 todos → check one off → refresh → data persists
11. Open `/devotion` → log today's Bible passage + lesson → devotion card shows on dashboard
12. Import XML reading plan → 365 days appear in progress list → today's reading shows in `TodaysReadingCard`
13. Mark a reading day complete → progress bar increments → streak counter updates
14. Switch language (vi ↔ en) → all UI labels and suggestion messages change
15. Export JSON → delete all data → import JSON → all data (including devotions + reading plan) restored

import { useTranslation } from 'react-i18next'
import { format, startOfWeek, endOfWeek, parseISO, differenceInDays } from 'date-fns'
import { vi } from 'date-fns/locale'
import { useAuthStore } from '@/store/useAuthStore'
import { useCurrentUserId } from '@/store/useAuthStore'
import { useTransactions } from '@/hooks/useFinance'
import { useTasks } from '@/hooks/useTasks'
import { usePlannerItems } from '@/hooks/usePlanner'
import { useEvents } from '@/hooks/useCalendar'
import { useWeightLogs } from '@/hooks/useHealth'
import { formatCurrency, formatDate, todayStr } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function DashboardPage() {
  const { t } = useTranslation()
  const session = useAuthStore(s => s.session)
  const userId = useCurrentUserId()
  const today = todayStr()
  const currentMonth = format(new Date(), 'yyyy-MM')

  const { data: transactions = [] } = useTransactions('month')
  const { data: tasks = [] } = useTasks()
  const { data: plannerItems = [] } = usePlannerItems(today)
  const { data: events = [] } = useEvents(currentMonth)
  const { data: weightLogs = [] } = useWeightLogs()

  // Finance stats
  const income = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const expense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)

  // Tasks stats
  const tasksDoneToday = tasks.filter(t => t.status === 'done' && t.updatedAt?.startsWith(today)).length

  // Planner
  const plannerDone = plannerItems.filter(p => p.isDone).length

  // Upcoming events (this week and forward, max 3)
  const weekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd')
  const weekEnd = format(endOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd') + 'T23:59:59'
  const upcomingEvents = events
    .filter(e => e.startAt >= today)
    .sort((a, b) => a.startAt.localeCompare(b.startAt))
    .slice(0, 3)

  // Health suggestion
  const sortedWeightLogs = [...weightLogs].sort((a, b) => b.date.localeCompare(a.date))
  const latestWeight = sortedWeightLogs[0]
  const daysSinceWeight = latestWeight
    ? differenceInDays(new Date(), parseISO(latestWeight.date))
    : null

  let healthSuggestion = 'Hãy bắt đầu theo dõi sức khỏe!'
  if (latestWeight) {
    if (daysSinceWeight !== null && daysSinceWeight >= 3) {
      healthSuggestion = 'Nhớ cân hôm nay!'
    } else {
      healthSuggestion = `Cân nặng gần nhất: ${latestWeight.weightKg} kg (${formatDate(latestWeight.date)})`
    }
  }

  // Recent transactions
  const recentTransactions = [...transactions]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 3)

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Chào buổi sáng'
    if (h < 18) return 'Chào buổi chiều'
    return 'Chào buổi tối'
  }

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold">
          {greeting()}, {session?.displayName ?? 'bạn'} 👋
        </h1>
        <p className="text-muted-foreground capitalize">
          {format(new Date(), 'EEEE, dd MMMM yyyy', { locale: vi })}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-blue-600">{tasks.length}</div>
            <div className="text-sm text-muted-foreground">Tổng công việc</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-green-600">{tasksDoneToday}</div>
            <div className="text-sm text-muted-foreground">Hoàn thành hôm nay</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-emerald-600">{formatCurrency(income)}</div>
            <div className="text-sm text-muted-foreground">Thu tháng này</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-red-500">{formatCurrency(expense)}</div>
            <div className="text-sm text-muted-foreground">Chi tháng này</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Today's Planner */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Kế hoạch hôm nay</CardTitle>
          </CardHeader>
          <CardContent>
            {plannerItems.length === 0 ? (
              <p className="text-sm text-muted-foreground">Không có công việc nào hôm nay.</p>
            ) : (
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground mb-1">
                  {plannerDone}/{plannerItems.length} hoàn thành
                </div>
                {plannerItems.slice(0, 5).map(item => (
                  <div key={item.id} className="flex items-center gap-2 text-sm">
                    <span className={item.isDone ? 'line-through text-muted-foreground' : ''}>
                      {item.title}
                    </span>
                    {item.isDone && <Badge className="bg-green-100 text-green-800 text-xs">Xong</Badge>}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Sự kiện sắp tới</CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground">Không có sự kiện sắp tới.</p>
            ) : (
              <div className="space-y-2">
                {upcomingEvents.map(e => (
                  <div key={e.id} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: e.color }} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{e.title}</div>
                      <div className="text-xs text-muted-foreground">{formatDate(e.startAt.split('T')[0])}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Health */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Sức khỏe</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{healthSuggestion}</p>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Giao dịch gần đây</CardTitle>
          </CardHeader>
          <CardContent>
            {recentTransactions.length === 0 ? (
              <p className="text-sm text-muted-foreground">Chưa có giao dịch.</p>
            ) : (
              <div className="space-y-2">
                {recentTransactions.map(tx => (
                  <div key={tx.id} className="flex items-center justify-between text-sm">
                    <div>
                      <div className="font-medium truncate max-w-[180px]">{tx.description}</div>
                      <div className="text-xs text-muted-foreground">{formatDate(tx.date)} · {tx.category}</div>
                    </div>
                    <span className={tx.type === 'income' ? 'text-green-600 font-semibold' : 'text-red-500 font-semibold'}>
                      {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

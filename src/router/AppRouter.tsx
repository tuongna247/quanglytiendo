import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/useAuthStore'
import AuthGate from '@/components/auth/AuthGate'
import ProtectedRoute from './ProtectedRoute'
import AppShell from '@/components/layout/AppShell'
import DashboardPage from '@/pages/DashboardPage'
import CalendarPage from '@/pages/CalendarPage'
import TasksPage from '@/pages/TasksPage'
import FinancePage from '@/pages/FinancePage'
import PlannerPage from '@/pages/PlannerPage'
import HealthPage from '@/pages/HealthPage'
import JournalPage from '@/pages/JournalPage'
import DevotionPage from '@/pages/DevotionPage'
import SettingsPage from '@/pages/SettingsPage'
import EbookPage from '@/pages/EbookPage'

function LoginRoute() {
  const session = useAuthStore(s => s.session)
  if (session) return <Navigate to="/" replace />
  return <AuthGate />
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginRoute />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route index element={<DashboardPage />} />
            <Route path="calendar" element={<CalendarPage />} />
            <Route path="tasks" element={<TasksPage />} />
            <Route path="finance" element={<FinancePage />} />
            <Route path="planner" element={<PlannerPage />} />
            <Route path="health" element={<HealthPage />} />
            <Route path="journal" element={<JournalPage />} />
            <Route path="devotion" element={<DevotionPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="ebook" element={<EbookPage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

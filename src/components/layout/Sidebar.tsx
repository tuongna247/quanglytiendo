import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  LayoutDashboard, Calendar, CheckSquare, Wallet,
  ClipboardList, Heart, BookOpen, BookMarked, Settings,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { to: '/', icon: LayoutDashboard, labelKey: 'nav.dashboard' },
  { to: '/calendar', icon: Calendar, labelKey: 'nav.calendar' },
  { to: '/tasks', icon: CheckSquare, labelKey: 'nav.tasks' },
  { to: '/finance', icon: Wallet, labelKey: 'nav.finance' },
  { to: '/planner', icon: ClipboardList, labelKey: 'nav.planner' },
  { to: '/health', icon: Heart, labelKey: 'nav.health' },
  { to: '/journal', icon: BookOpen, labelKey: 'nav.journal' },
  { to: '/devotion', icon: BookMarked, labelKey: 'nav.devotion' },
  { to: '/settings', icon: Settings, labelKey: 'nav.settings' },
]

export default function Sidebar() {
  const { t } = useTranslation()
  return (
    <aside className="hidden md:flex flex-col w-56 border-r bg-sidebar text-sidebar-foreground shrink-0">
      <div className="h-14 flex items-center px-4 border-b font-semibold text-sm">
        {t('app.name')}
      </div>
      <nav className="flex-1 overflow-y-auto py-2">
        {NAV_ITEMS.map(({ to, icon: Icon, labelKey }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn('flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground',
                isActive && 'bg-accent text-accent-foreground font-medium')
            }
          >
            <Icon size={18} />
            {t(labelKey)}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}

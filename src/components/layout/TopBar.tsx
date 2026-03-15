import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/store/useAuthStore'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { LogOut, Globe } from 'lucide-react'
import i18n from '@/i18n'

export default function TopBar() {
  const { t } = useTranslation()
  const { session, clearSession } = useAuthStore()
  const initials = session?.displayName?.slice(0, 2).toUpperCase() ?? '?'

  const toggleLang = () => {
    const next = i18n.language === 'vi' ? 'en' : 'vi'
    i18n.changeLanguage(next)
    localStorage.setItem('lang', next)
  }

  return (
    <header className="h-14 border-b flex items-center justify-between px-4 bg-background shrink-0">
      {/* Mobile app name */}
      <span className="md:hidden font-semibold text-sm">{t('app.name')}</span>
      <div className="hidden md:block" />

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={toggleLang} title="Switch language">
          <Globe size={18} />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-9 w-9 rounded-full p-0">
              <Avatar className="h-8 w-8">
                <AvatarFallback
                  style={{ backgroundColor: session?.avatarColor ?? '#6b7280' }}
                  className="text-white text-xs font-semibold"
                >
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <div className="px-2 py-1.5 text-sm">
              <p className="font-medium">{session?.displayName}</p>
              <p className="text-muted-foreground text-xs">@{session?.username}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={clearSession} className="text-destructive">
              <LogOut size={14} className="mr-2" />
              {t('auth.logout')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

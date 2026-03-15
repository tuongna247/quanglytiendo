import { useTranslation } from 'react-i18next'

export default function SettingsPage() {
  const { t } = useTranslation()
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">{t('nav.settings')}</h1>
      <p className="text-muted-foreground">Settings — coming soon.</p>
    </div>
  )
}

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { userRepository } from '@/db/userRepository'
import { useAuthStore } from '@/store/useAuthStore'

const schema = z.object({
  username: z.string().min(1, 'Bắt buộc'),
  password: z.string().min(1, 'Bắt buộc'),
})
type FormData = z.infer<typeof schema>

interface Props { onSwitch: () => void }

export default function LoginPage({ onSwitch }: Props) {
  const { t } = useTranslation()
  const { setSession } = useAuthStore()
  const [error, setError] = useState('')
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setError('')
    const user = await userRepository.getByUsername(data.username)
    if (!user) { setError(t('auth.invalidCredentials')); return }

    const ok = await bcrypt.compare(data.password, user.passwordHash)
    if (!ok) { setError(t('auth.invalidCredentials')); return }

    const expires = new Date()
    expires.setDate(expires.getDate() + 7)
    setSession({ userId: user.id, username: user.username, displayName: user.displayName, avatarColor: user.avatarColor, expiresAt: expires.toISOString() })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader><CardTitle className="text-center">{t('auth.login')}</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1">
              <Label>{t('auth.username')}</Label>
              <Input {...register('username')} placeholder="nguyen_van_a" autoFocus />
              {errors.username && <p className="text-xs text-destructive">{errors.username.message}</p>}
            </div>
            <div className="space-y-1">
              <Label>{t('auth.password')}</Label>
              <Input type="password" {...register('password')} />
              {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={isSubmitting}>{t('auth.login')}</Button>
            <p className="text-center text-sm text-muted-foreground">
              {t('auth.noAccount')}{' '}
              <button type="button" onClick={onSwitch} className="text-primary hover:underline">{t('auth.register')}</button>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuthStore } from '@/store/useAuthStore'
import { api } from '@/lib/apiClient'
import type { Session } from '@/types/auth.types'

const schema = z.object({
  username: z.string().min(1, 'Bắt buộc'),
  password: z.string().min(1, 'Bắt buộc'),
})
type FormData = z.infer<typeof schema>

interface Props { onSwitch: () => void; onForgot: () => void }

interface AuthResponse {
  token: string
  userId: string
  username: string
  displayName: string
  avatarColor: string
  expiresAt: string
}

export default function LoginPage({ onSwitch, onForgot }: Props) {
  const { t } = useTranslation()
  const { setSession } = useAuthStore()
  const [error, setError] = useState('')
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setError('')
    try {
      const res = await api.post<AuthResponse>('/api/auth/login', data)
      const session: Session = {
        userId: res.userId,
        username: res.username,
        displayName: res.displayName,
        avatarColor: res.avatarColor,
        expiresAt: res.expiresAt,
        token: res.token,
      }
      setSession(session)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('auth.invalidCredentials'))
    }
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
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>
                {t('auth.noAccount')}{' '}
                <button type="button" onClick={onSwitch} className="text-primary hover:underline">{t('auth.register')}</button>
              </span>
              <button type="button" onClick={onForgot} className="text-primary hover:underline">Quên mật khẩu?</button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

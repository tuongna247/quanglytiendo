import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { nanoid } from 'nanoid'
import bcrypt from 'bcryptjs'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { userRepository } from '@/db/userRepository'
import { useAuthStore } from '@/store/useAuthStore'
import { AVATAR_COLORS } from '@/lib/constants'
import { nowISO } from '@/lib/utils'

const schema = z.object({
  username: z.string().min(3, 'Tối thiểu 3 ký tự').max(30).regex(/^[a-z0-9_]+$/, 'Chỉ dùng a-z, 0-9, _'),
  displayName: z.string().min(1, 'Bắt buộc').max(50),
  password: z.string().min(6, 'Tối thiểu 6 ký tự'),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, {
  message: 'Mật khẩu không khớp',
  path: ['confirmPassword'],
})
type FormData = z.infer<typeof schema>

interface Props { onSwitch: () => void }

export default function RegisterPage({ onSwitch }: Props) {
  const { t } = useTranslation()
  const { setSession } = useAuthStore()
  const [error, setError] = useState('')
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setError('')
    const existing = await userRepository.getByUsername(data.username)
    if (existing) { setError(t('auth.usernameExists')); return }

    const passwordHash = await bcrypt.hash(data.password, 10)
    const color = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]
    const user = { id: nanoid(), username: data.username, displayName: data.displayName, passwordHash, avatarColor: color, createdAt: nowISO() }
    await userRepository.create(user)

    const expires = new Date()
    expires.setDate(expires.getDate() + 7)
    setSession({ userId: user.id, username: user.username, displayName: user.displayName, avatarColor: color, expiresAt: expires.toISOString() })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader><CardTitle className="text-center">{t('auth.register')}</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1">
              <Label>{t('auth.username')}</Label>
              <Input {...register('username')} placeholder="nguyen_van_a" autoFocus />
              {errors.username && <p className="text-xs text-destructive">{errors.username.message}</p>}
            </div>
            <div className="space-y-1">
              <Label>{t('auth.displayName')}</Label>
              <Input {...register('displayName')} placeholder="Nguyễn Văn A" />
              {errors.displayName && <p className="text-xs text-destructive">{errors.displayName.message}</p>}
            </div>
            <div className="space-y-1">
              <Label>{t('auth.password')}</Label>
              <Input type="password" {...register('password')} />
              {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
            </div>
            <div className="space-y-1">
              <Label>{t('auth.confirmPassword')}</Label>
              <Input type="password" {...register('confirmPassword')} />
              {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>}
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={isSubmitting}>{t('auth.register')}</Button>
            <p className="text-center text-sm text-muted-foreground">
              {t('auth.hasAccount')}{' '}
              <button type="button" onClick={onSwitch} className="text-primary hover:underline">{t('auth.login')}</button>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

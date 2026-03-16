import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { api } from '@/lib/apiClient'

const schema = z.object({
  email: z.string().email('Email không hợp lệ'),
})
type FormData = z.infer<typeof schema>

interface Props { onBack: () => void }

export default function ForgotPasswordPage({ onBack }: Props) {
  const [sent, setSent] = useState(false)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    await api.post('/api/auth/forgot-password', data)
    setSent(true)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader><CardTitle className="text-center">Quên mật khẩu</CardTitle></CardHeader>
        <CardContent>
          {sent ? (
            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                Nếu email tồn tại, bạn sẽ nhận được link đặt lại mật khẩu trong vài phút.
              </p>
              <Button variant="outline" className="w-full" onClick={onBack}>Quay lại đăng nhập</Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1">
                <Label>Email</Label>
                <Input type="email" {...register('email')} placeholder="email@example.com" autoFocus />
                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>Gửi link đặt lại</Button>
              <Button type="button" variant="ghost" className="w-full" onClick={onBack}>Quay lại</Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

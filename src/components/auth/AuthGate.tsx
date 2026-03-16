import { useState } from 'react'
import LoginPage from './LoginPage'
import RegisterPage from './RegisterPage'
import ForgotPasswordPage from './ForgotPasswordPage'

type Mode = 'login' | 'register' | 'forgot'

export default function AuthGate() {
  const [mode, setMode] = useState<Mode>('login')

  if (mode === 'forgot') return <ForgotPasswordPage onBack={() => setMode('login')} />
  if (mode === 'register') return <RegisterPage onSwitch={() => setMode('login')} />
  return <LoginPage onSwitch={() => setMode('register')} onForgot={() => setMode('forgot')} />
}

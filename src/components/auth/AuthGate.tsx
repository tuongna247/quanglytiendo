import { useState } from 'react'
import LoginPage from './LoginPage'
import RegisterPage from './RegisterPage'

export default function AuthGate() {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  return mode === 'login'
    ? <LoginPage onSwitch={() => setMode('register')} />
    : <RegisterPage onSwitch={() => setMode('login')} />
}

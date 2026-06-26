'use client'

import { useState } from 'react'
import { getSupabaseBrowser } from '@/lib/supabase'
import { Stethoscope } from 'lucide-react'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const { error } = await getSupabaseBrowser().auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }

    toast.success('Login realizado!')
    window.location.href = '/dashboard'
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#faf9f7] p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#0f3b5e] rounded-2xl mb-5 shadow-lg shadow-[#0f3b5e]/10">
            <Stethoscope size={32} className="text-[#2dd4bf]" />
          </div>
          <h1 className="text-3xl text-[#0f3b5e]" style={{ fontFamily: "'DM Serif Display', serif" }}>
            BotLibertad
          </h1>
          <p className="text-[15px] text-[#6b7280] mt-1.5" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            CRM da Clínica
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-[#eae7e2] p-8 shadow-sm">
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#1a1a2e] mb-1.5">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1a1a2e] mb-1.5">
                Senha
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-base"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-[#9ca3af] mt-6">
          Clínica de Fonoaudiologia — Dra. Libertad Ramirez
        </p>
      </div>
    </div>
  )
}

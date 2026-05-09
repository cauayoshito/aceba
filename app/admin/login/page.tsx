'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setStatus('')

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setStatus(error.message === 'Invalid login credentials'
        ? 'E-mail ou senha incorretos. Verifique e tente novamente.'
        : error.message)
      setLoading(false)
      return
    }

    router.push('/admin')
    router.refresh()
  }

  return (
    <body className="admin-login-page">
      <main className="login-shell">
        <div className="login-logo">
          <img src="/logos/aceba.png" alt="Logo ACEBA" />
        </div>
        <section className="login-card">
          <p className="login-badge">
            <span className="login-badge-dot"></span> Painel Admin
          </p>
          <h1>Acesso institucional</h1>
          <p className="login-lead">
            Entre com o e-mail autorizado para gerenciar parcerias, notícias e galeria do site da ACEBA.
          </p>
          <form onSubmit={handleSubmit} className="admin-form" noValidate>
            <label>
              E-mail
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
                placeholder="seu@email.com.br"
                required
                disabled={loading}
              />
            </label>
            <label>
              Senha
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
                placeholder="••••••••"
                required
                disabled={loading}
              />
            </label>
            <button
              type="submit"
              className="admin-button"
              style={{ width: '100%', marginTop: '4px' }}
              disabled={loading}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
            {status && (
              <p className="admin-status" role="status" style={{ color: '#e53e3e' }}>
                {status}
              </p>
            )}
          </form>
        </section>
      </main>
    </body>
  )
}

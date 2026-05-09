'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const FIELDS = [
  { key: 'whatsapp', label: 'WhatsApp (número com DDI)', type: 'text', placeholder: '5571999999999' },
  { key: 'phone', label: 'Telefone', type: 'text', placeholder: '(71) 99999-9999' },
  { key: 'email', label: 'E-mail institucional', type: 'email', placeholder: 'contato@aceba.org.br' },
  { key: 'address', label: 'Endereço completo', type: 'textarea' },
  { key: 'pix_key', label: 'Chave Pix / CNPJ', type: 'text', placeholder: '05.133.450/0001-76' },
  { key: 'instagram', label: 'Instagram (URL)', type: 'url', placeholder: 'https://instagram.com/aceba' },
  { key: 'facebook', label: 'Facebook (URL)', type: 'url', placeholder: 'https://facebook.com/aceba' },
] as const

interface Props { settings: Record<string, string> }

export default function ConfiguracoesClient({ settings: initial }: Props) {
  const [values, setValues] = useState<Record<string, string>>(initial)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [msgType, setMsgType] = useState<'ok' | 'err'>('ok')

  const supabase = createClient()

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true); setMsg('')

    const upserts = Object.entries(values).map(([key, value]) => ({ key, value }))

    const { error } = await supabase
      .from('site_settings')
      .upsert(upserts, { onConflict: 'key' })

    if (error) {
      setMsg('Erro ao salvar: ' + error.message)
      setMsgType('err')
    } else {
      setMsg('Configurações salvas com sucesso!')
      setMsgType('ok')
    }
    setSaving(false)
    setTimeout(() => setMsg(''), 4000)
  }

  return (
    <main className="admin-main">
      <div className="admin-topbar">
        <div>
          <h1 className="admin-page-title">Configurações</h1>
          <p className="admin-page-sub">Dados de contato e informações institucionais exibidos no site.</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="admin-settings-form">
        <div className="admin-card">
          <h2 className="admin-card-title">Dados de contato</h2>
          <div className="admin-form">
            {FIELDS.map(field => (
              <label key={field.key}>
                {field.label}
                {field.type === 'textarea' ? (
                  <textarea
                    rows={3}
                    value={values[field.key] || ''}
                    onChange={e => setValues(v => ({ ...v, [field.key]: e.target.value }))}
                    placeholder={(field as { placeholder?: string }).placeholder}
                  />
                ) : (
                  <input
                    type={field.type}
                    value={values[field.key] || ''}
                    onChange={e => setValues(v => ({ ...v, [field.key]: e.target.value }))}
                    placeholder={(field as { placeholder?: string }).placeholder}
                  />
                )}
              </label>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1.5rem' }}>
          <button type="submit" className="admin-button" disabled={saving}>
            {saving ? 'Salvando...' : 'Salvar configurações'}
          </button>
          {msg && (
            <p className="admin-status" style={{ color: msgType === 'ok' ? '#009B3A' : '#e53e3e', margin: 0 }}>
              {msgType === 'ok' ? '✓ ' : '✕ '}{msg}
            </p>
          )}
        </div>
      </form>
    </main>
  )
}

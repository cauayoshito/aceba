'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Partner } from '@/lib/types'
import Link from 'next/link'

interface Props { partners: Partner[] }

const EMPTY: Partial<Partner> = {
  name: '', description: '', logo_url: '', website_url: '', sort_order: 0, is_active: true
}

export default function ParcelasClient({ partners: initial }: Props) {
  const [partners, setPartners] = useState<Partner[]>(initial)
  const [modal, setModal] = useState<{ open: boolean; editing: Partner | null }>({ open: false, editing: null })
  const [form, setForm] = useState<Partial<Partner>>(EMPTY)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  const supabase = createClient()

  function openNew() { setForm(EMPTY); setModal({ open: true, editing: null }); setMsg('') }
  function openEdit(p: Partner) { setForm(p); setModal({ open: true, editing: p }); setMsg('') }
  function closeModal() { setModal({ open: false, editing: null }) }

  async function handleSave() {
    if (!form.name?.trim()) { setMsg('Nome é obrigatório.'); return }
    setSaving(true); setMsg('')
    const payload = {
      name: form.name,
      description: form.description || null,
      logo_url: form.logo_url || null,
      website_url: form.website_url || null,
      sort_order: Number(form.sort_order) || 0,
      is_active: form.is_active ?? true,
    }
    if (modal.editing) {
      const { error } = await supabase.from('partners').update(payload).eq('id', modal.editing.id)
      if (error) { setMsg(error.message); setSaving(false); return }
      setPartners(ps => ps.map(p => p.id === modal.editing!.id ? { ...p, ...payload } : p))
    } else {
      const { data, error } = await supabase.from('partners').insert(payload).select().single()
      if (error) { setMsg(error.message); setSaving(false); return }
      setPartners(ps => [...ps, data as Partner])
    }
    setSaving(false); closeModal()
  }

  async function handleDelete(id: string) {
    if (!confirm('Excluir esta parceria?')) return
    const { error } = await supabase.from('partners').delete().eq('id', id)
    if (error) { alert(error.message); return }
    setPartners(ps => ps.filter(p => p.id !== id))
  }

  async function toggleActive(p: Partner) {
    const { error } = await supabase.from('partners').update({ is_active: !p.is_active }).eq('id', p.id)
    if (error) { alert(error.message); return }
    setPartners(ps => ps.map(x => x.id === p.id ? { ...x, is_active: !x.is_active } : x))
  }

  return (
    <main className="admin-main">
      <Link href="/admin" className="admin-back-button">← Voltar ao painel</Link>
      <div className="admin-topbar">
        <div>
          <h1 className="admin-page-title">Parcerias</h1>
          <p className="admin-page-sub">Empresas, instituições e apoiadores da ACEBA.</p>
        </div>
        <button onClick={openNew} className="admin-button">+ Adicionar parceria</button>
      </div>

      {partners.length === 0 ? (
        <div className="admin-empty">
          <p>Nenhuma parceria cadastrada ainda.</p>
          <button onClick={openNew} className="admin-button">Adicionar a primeira</button>
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Site</th>
                <th>Ordem</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {partners.map(p => (
                <tr key={p.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      {p.logo_url && <img src={p.logo_url} alt="" style={{ width: 32, height: 32, objectFit: 'contain', borderRadius: 4 }} />}
                      <div>
                        <strong>{p.name}</strong>
                        {p.description && <p style={{ fontSize: '0.8rem', color: '#6B7280', margin: 0 }}>{p.description.slice(0, 60)}{p.description.length > 60 ? '…' : ''}</p>}
                      </div>
                    </div>
                  </td>
                  <td>{p.website_url ? <a href={p.website_url} target="_blank" rel="noopener" style={{ color: '#009B3A', fontSize: '0.85rem' }}>↗ Link</a> : '—'}</td>
                  <td>{p.sort_order}</td>
                  <td>
                    <button onClick={() => toggleActive(p)} className={`admin-badge ${p.is_active ? 'admin-badge--active' : 'admin-badge--inactive'}`}>
                      {p.is_active ? 'Ativo' : 'Inativo'}
                    </button>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => openEdit(p)} className="admin-button admin-button--sm">Editar</button>
                      <button onClick={() => handleDelete(p.id)} className="admin-button admin-button--sm admin-button--danger">Excluir</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal.open && (
        <div className="admin-modal-overlay" onClick={closeModal}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-head">
              <h2>{modal.editing ? 'Editar parceria' : 'Nova parceria'}</h2>
              <button onClick={closeModal} className="admin-modal-close" aria-label="Fechar">✕</button>
            </div>
            <div className="admin-modal-body">
              <div className="admin-form">
                <label>Nome do parceiro *<input type="text" value={form.name || ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Ex.: Prefeitura de Camaçari" /></label>
                <label>Descrição<textarea rows={2} value={form.description || ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Breve descrição da parceria..." /></label>
                <label>URL do logo<input type="url" value={form.logo_url || ''} onChange={e => setForm(f => ({ ...f, logo_url: e.target.value }))} placeholder="https://..." /></label>
                <label>Site (URL)<input type="url" value={form.website_url || ''} onChange={e => setForm(f => ({ ...f, website_url: e.target.value }))} placeholder="https://..." /></label>
                <label>Ordem de exibição<input type="number" value={form.sort_order ?? 0} onChange={e => setForm(f => ({ ...f, sort_order: parseInt(e.target.value) || 0 }))} /></label>
                <label className="checkbox-label">
                  <input type="checkbox" checked={form.is_active ?? true} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} />
                  Ativo no site
                </label>
                {msg && <p className="admin-status" style={{ color: '#e53e3e' }}>{msg}</p>}
              </div>
            </div>
            <div className="admin-modal-foot">
              <button onClick={closeModal} className="admin-button admin-button--outline">Cancelar</button>
              <button onClick={handleSave} className="admin-button" disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

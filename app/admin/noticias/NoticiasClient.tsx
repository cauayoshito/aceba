'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { NewsItem } from '@/lib/types'
import Link from 'next/link'

interface Props { news: NewsItem[] }

const today = () => new Date().toISOString().slice(0, 10)
const EMPTY: Partial<NewsItem> = { title: '', category: '', cover_url: '', excerpt: '', content: '', link_url: '', published_at: today(), is_active: true }

export default function NoticiasClient({ news: initial }: Props) {
  const [news, setNews] = useState<NewsItem[]>(initial)
  const [modal, setModal] = useState<{ open: boolean; editing: NewsItem | null }>({ open: false, editing: null })
  const [form, setForm] = useState<Partial<NewsItem>>(EMPTY)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  const supabase = createClient()

  function openNew() { setForm({ ...EMPTY, published_at: today() }); setModal({ open: true, editing: null }); setMsg('') }
  function openEdit(n: NewsItem) { setForm(n); setModal({ open: true, editing: n }); setMsg('') }
  function closeModal() { setModal({ open: false, editing: null }) }

  async function handleSave() {
    if (!form.title?.trim()) { setMsg('Título é obrigatório.'); return }
    setSaving(true); setMsg('')
    const payload = {
      title: form.title,
      category: form.category || null,
      cover_url: form.cover_url || null,
      excerpt: form.excerpt || null,
      content: form.content || null,
      link_url: form.link_url || null,
      published_at: form.published_at || today(),
      is_active: form.is_active ?? true,
    }
    if (modal.editing) {
      const { error } = await supabase.from('news').update(payload).eq('id', modal.editing.id)
      if (error) { setMsg(error.message); setSaving(false); return }
      setNews(ns => ns.map(n => n.id === modal.editing!.id ? { ...n, ...payload } : n))
    } else {
      const { data, error } = await supabase.from('news').insert(payload).select().single()
      if (error) { setMsg(error.message); setSaving(false); return }
      setNews(ns => [data as NewsItem, ...ns])
    }
    setSaving(false); closeModal()
  }

  async function handleDelete(id: string) {
    if (!confirm('Excluir esta notícia?')) return
    const { error } = await supabase.from('news').delete().eq('id', id)
    if (error) { alert(error.message); return }
    setNews(ns => ns.filter(n => n.id !== id))
  }

  async function toggleActive(n: NewsItem) {
    const { error } = await supabase.from('news').update({ is_active: !n.is_active }).eq('id', n.id)
    if (error) { alert(error.message); return }
    setNews(ns => ns.map(x => x.id === n.id ? { ...x, is_active: !x.is_active } : x))
  }

  return (
    <main className="admin-main">
      <Link href="/admin" className="admin-back-button">← Voltar ao painel</Link>
      <div className="admin-topbar">
        <div>
          <h1 className="admin-page-title">Notícias</h1>
          <p className="admin-page-sub">Publicações e atualizações do Instituto.</p>
        </div>
        <button onClick={openNew} className="admin-button">+ Nova notícia</button>
      </div>

      {news.length === 0 ? (
        <div className="admin-empty">
          <p>Nenhuma notícia cadastrada ainda.</p>
          <button onClick={openNew} className="admin-button">Criar a primeira</button>
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr><th>Título</th><th>Categoria</th><th>Data</th><th>Status</th><th>Ações</th></tr>
            </thead>
            <tbody>
              {news.map(n => (
                <tr key={n.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      {n.cover_url && <img src={n.cover_url} alt="" style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 6 }} />}
                      <div>
                        <strong>{n.title}</strong>
                        {n.excerpt && <p style={{ fontSize: '0.8rem', color: '#6B7280', margin: 0 }}>{n.excerpt.slice(0, 60)}{n.excerpt.length > 60 ? '…' : ''}</p>}
                      </div>
                    </div>
                  </td>
                  <td>{n.category || '—'}</td>
                  <td style={{ fontSize: '0.85rem', whiteSpace: 'nowrap' }}>{n.published_at ? new Date(n.published_at + 'T00:00:00').toLocaleDateString('pt-BR') : '—'}</td>
                  <td>
                    <button onClick={() => toggleActive(n)} className={`admin-badge ${n.is_active ? 'admin-badge--active' : 'admin-badge--inactive'}`}>
                      {n.is_active ? 'Publicado' : 'Rascunho'}
                    </button>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => openEdit(n)} className="admin-button admin-button--sm">Editar</button>
                      <button onClick={() => handleDelete(n.id)} className="admin-button admin-button--sm admin-button--danger">Excluir</button>
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
          <div className="admin-modal admin-modal--wide" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-head">
              <h2>{modal.editing ? 'Editar notícia' : 'Nova notícia'}</h2>
              <button onClick={closeModal} className="admin-modal-close" aria-label="Fechar">✕</button>
            </div>
            <div className="admin-modal-body">
              <div className="admin-form">
                <label>Título *<input type="text" value={form.title || ''} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></label>
                <label>Categoria<input type="text" value={form.category || ''} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="Ex.: EDUCAÇÃO, ESPORTE, PARCERIA" /></label>
                <label>URL da imagem de capa<input type="url" value={form.cover_url || ''} onChange={e => setForm(f => ({ ...f, cover_url: e.target.value }))} placeholder="https://..." /></label>
                <label>Link do post (Instagram ou outro)<input type="url" value={form.link_url || ''} onChange={e => setForm(f => ({ ...f, link_url: e.target.value }))} placeholder="https://www.instagram.com/p/..." /></label>
                <label>Resumo (excerpt)<textarea rows={3} value={form.excerpt || ''} onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))} placeholder="Breve descrição para listagem..." /></label>
                <label>Conteúdo completo<textarea rows={8} value={form.content || ''} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} /></label>
                <label>Data de publicação<input type="date" value={form.published_at || today()} onChange={e => setForm(f => ({ ...f, published_at: e.target.value }))} /></label>
                <label className="checkbox-label">
                  <input type="checkbox" checked={form.is_active ?? true} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} />
                  Publicar no site
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

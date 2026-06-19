'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { GalleryImage } from '@/lib/types'
import Link from 'next/link'

interface Props { images: GalleryImage[] }

const EMPTY: Partial<GalleryImage> = {
  title: '', category: '', image_url: '', is_active: true
}

export default function GaleriaClient({ images: initial }: Props) {
  const [images, setImages] = useState<GalleryImage[]>(initial)
  const [modal, setModal] = useState<{ open: boolean; editing: GalleryImage | null }>({ open: false, editing: null })
  const [form, setForm] = useState<Partial<GalleryImage>>(EMPTY)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [uploading, setUploading] = useState(false)

  const supabase = createClient()

  function openNew() { setForm(EMPTY); setModal({ open: true, editing: null }); setMsg('') }
  function openEdit(img: GalleryImage) { setForm(img); setModal({ open: true, editing: img }); setMsg('') }
  function closeModal() { setModal({ open: false, editing: null }) }

  async function handleUpload(file: File) {
    setUploading(true)
    const ext = file.name.split('.').pop()
    const path = `${Date.now()}.${ext}`
    const { data, error } = await supabase.storage.from('gallery').upload(path, file, { upsert: false })
    if (error) { setMsg('Erro no upload: ' + error.message); setUploading(false); return }
    const { data: { publicUrl } } = supabase.storage.from('gallery').getPublicUrl(data.path)
    setForm(f => ({ ...f, image_url: publicUrl }))
    setUploading(false)
  }

  async function handleSave() {
    if (!form.image_url?.trim()) { setMsg('URL da imagem é obrigatória.'); return }
    setSaving(true); setMsg('')
    const payload = {
      title: form.title || null,
      category: form.category || null,
      image_url: form.image_url,
      is_active: form.is_active ?? true,
    }
    if (modal.editing) {
      const { error } = await supabase.from('gallery_images').update(payload).eq('id', modal.editing.id)
      if (error) { setMsg(error.message); setSaving(false); return }
      setImages(imgs => imgs.map(i => i.id === modal.editing!.id ? { ...i, ...payload } : i))
    } else {
      const { data, error } = await supabase.from('gallery_images').insert(payload).select().single()
      if (error) { setMsg(error.message); setSaving(false); return }
      setImages(imgs => [data as GalleryImage, ...imgs])
    }
    setSaving(false); closeModal()
  }

  async function handleDelete(id: string) {
    if (!confirm('Excluir esta imagem?')) return
    const { error } = await supabase.from('gallery_images').delete().eq('id', id)
    if (error) { alert(error.message); return }
    setImages(imgs => imgs.filter(i => i.id !== id))
  }

  async function toggleActive(img: GalleryImage) {
    const { error } = await supabase.from('gallery_images').update({ is_active: !img.is_active }).eq('id', img.id)
    if (error) { alert(error.message); return }
    setImages(imgs => imgs.map(i => i.id === img.id ? { ...i, is_active: !i.is_active } : i))
  }

  return (
    <main className="admin-main">
      <Link href="/admin" className="admin-back-button">← Voltar ao painel</Link>
      <div className="admin-topbar">
        <div>
          <h1 className="admin-page-title">Galeria</h1>
          <p className="admin-page-sub">Fotos e registros de atividades da ACEBA.</p>
        </div>
        <button onClick={openNew} className="admin-button">+ Adicionar imagem</button>
      </div>

      {images.length === 0 ? (
        <div className="admin-empty">
          <p>Nenhuma imagem na galeria ainda.</p>
          <button onClick={openNew} className="admin-button">Adicionar a primeira</button>
        </div>
      ) : (
        <div className="gallery-admin-grid">
          {images.map(img => (
            <div key={img.id} className={`gallery-admin-card${!img.is_active ? ' is-inactive' : ''}`}>
              <div className="gallery-admin-img">
                <img src={img.image_url} alt={img.title || ''} />
                {!img.is_active && <span className="gallery-admin-badge">Inativo</span>}
              </div>
              <div className="gallery-admin-body">
                <p className="gallery-admin-title">{img.title || <em style={{ color: '#9CA3AF' }}>Sem título</em>}</p>
                {img.category && <p className="gallery-admin-cat">{img.category}</p>}
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                  <button onClick={() => openEdit(img)} className="admin-button admin-button--sm">Editar</button>
                  <button onClick={() => toggleActive(img)} className="admin-button admin-button--sm admin-button--outline">{img.is_active ? 'Desativar' : 'Ativar'}</button>
                  <button onClick={() => handleDelete(img.id)} className="admin-button admin-button--sm admin-button--danger">Excluir</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal.open && (
        <div className="admin-modal-overlay" onClick={closeModal}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-head">
              <h2>{modal.editing ? 'Editar imagem' : 'Adicionar imagem'}</h2>
              <button onClick={closeModal} className="admin-modal-close" aria-label="Fechar">✕</button>
            </div>
            <div className="admin-modal-body">
              <div className="admin-form">
                <label>
                  Imagem *
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <input
                      type="url"
                      value={form.image_url || ''}
                      onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))}
                      placeholder="https://..."
                    />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#6B7280' }}>
                      <span>ou</span>
                      <label className="admin-upload-btn">
                        {uploading ? 'Enviando...' : '📁 Upload do computador'}
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          disabled={uploading}
                          onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload(f) }}
                        />
                      </label>
                    </div>
                    {form.image_url && (
                      <img src={form.image_url} alt="Preview" style={{ maxHeight: 120, objectFit: 'cover', borderRadius: 8, marginTop: 4 }} />
                    )}
                  </div>
                </label>
                <label>Título<input type="text" value={form.title || ''} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Breve descrição..." /></label>
                <label>Categoria<input type="text" value={form.category || ''} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="Ex.: educação, eventos, capoeira" /></label>
                <label className="checkbox-label">
                  <input type="checkbox" checked={form.is_active ?? true} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} />
                  Ativa no site
                </label>
                {msg && <p className="admin-status" style={{ color: '#e53e3e' }}>{msg}</p>}
              </div>
            </div>
            <div className="admin-modal-foot">
              <button onClick={closeModal} className="admin-button admin-button--outline">Cancelar</button>
              <button onClick={handleSave} className="admin-button" disabled={saving || uploading}>{saving ? 'Salvando...' : 'Salvar'}</button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

'use client'

interface Props {
  userEmail: string
  partnersCount: number
  newsCount: number
  galleryCount: number
}

export default function DashboardClient({ userEmail, partnersCount, newsCount, galleryCount }: Props) {
  const firstName = userEmail.split('@')[0]

  return (
    <main className="admin-main">
      <div className="admin-topbar">
        <div>
          <h1 className="admin-page-title">Painel</h1>
          <p className="admin-page-sub">Bem-vindo(a), <strong>{firstName}</strong>. Gerencie o conteúdo do site da ACEBA.</p>
        </div>
        <a href="/" target="_blank" rel="noopener" className="admin-button admin-button--outline" style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}>
          ↗ Ver site
        </a>
      </div>

      {/* Stat cards */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="stat-icon stat-icon--partners">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <div className="stat-body">
            <p className="stat-label">Parcerias</p>
            <p className="stat-value">{partnersCount}</p>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="stat-icon stat-icon--news">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/>
            </svg>
          </div>
          <div className="stat-body">
            <p className="stat-label">Notícias</p>
            <p className="stat-value">{newsCount}</p>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="stat-icon stat-icon--gallery">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
            </svg>
          </div>
          <div className="stat-body">
            <p className="stat-label">Imagens na Galeria</p>
            <p className="stat-value">{galleryCount}</p>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="admin-section">
        <h2 className="admin-section-title">Ações rápidas</h2>
        <div className="admin-actions-grid">
          <a href="/admin/parcerias" className="admin-action-card">
            <span className="action-icon">🤝</span>
            <span>Gerenciar Parcerias</span>
          </a>
          <a href="/admin/noticias" className="admin-action-card">
            <span className="action-icon">📰</span>
            <span>Gerenciar Notícias</span>
          </a>
          <a href="/admin/galeria" className="admin-action-card">
            <span className="action-icon">🖼️</span>
            <span>Gerenciar Galeria</span>
          </a>
          <a href="/admin/configuracoes" className="admin-action-card">
            <span className="action-icon">⚙️</span>
            <span>Configurações do Site</span>
          </a>
        </div>
      </div>
    </main>
  )
}

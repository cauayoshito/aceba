import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { FALLBACK_NEWS } from '@/lib/fallback-news'
import type { NewsItem } from '@/lib/types'
import '../site.css'
import './parcerias.css'

export const metadata: Metadata = {
  title: 'Parcerias · ACEBA',
  description: 'Iniciativas, ações e parcerias que ampliam o trabalho da ACEBA na comunidade de Vila de Abrantes, Camaçari – BA.',
}

function formatNewsDate(dateStr?: string | null) {
  if (!dateStr) return ''
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })
    .toUpperCase().replace('.', '')
}

async function getAllNews(): Promise<NewsItem[]> {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('news')
      .select('*')
      .eq('is_active', true)
      .order('published_at', { ascending: false })
    if (data && data.length > 0) return data as NewsItem[]
  } catch {
    // segue para o fallback
  }
  return FALLBACK_NEWS
}

export default async function ParceriasPage() {
  const news = await getAllNews()

  return (
    <main className="parcerias-page">
      <header className="parcerias-topbar">
        <div className="parcerias-topbar-inner">
          <Link href="/" className="parcerias-back">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
            </svg>
            Voltar ao site
          </Link>
        </div>
      </header>

      <div className="parcerias-container">
        <div className="parcerias-head">
          <p className="parcerias-eyebrow">Rede de apoio · ACEBA</p>
          <h1 className="parcerias-title">Parcerias e ações</h1>
          <p className="parcerias-lead">
            Iniciativas, conquistas e parcerias que fortalecem nosso trabalho na comunidade
            de Vila de Abrantes. Clique para ler cada matéria na íntegra.
          </p>
        </div>

        {news.length === 0 ? (
          <p className="parcerias-empty">Nenhuma parceria publicada no momento.</p>
        ) : (
          <div className="parcerias-grid">
            {news.map((item) => (
              <Link key={item.id} href={`/noticias/${item.id}`} className="news-card" aria-label={item.title}>
                {item.cover_url && (
                  <div className="news-card-img">
                    <img src={item.cover_url} alt={item.title} loading="lazy" decoding="async" />
                  </div>
                )}
                <div className="news-card-body">
                  {item.category && <span className="news-card-cat-pill">{item.category}</span>}
                  <h3 className="news-card-title">{item.title}</h3>
                  {item.excerpt && <p className="news-card-excerpt">{item.excerpt}</p>}
                  <div className="news-card-foot">
                    {item.published_at && (
                      <time className="news-card-date" dateTime={item.published_at}>
                        {formatNewsDate(item.published_at)}
                      </time>
                    )}
                    <span className="news-card-insta">
                      Ler matéria
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

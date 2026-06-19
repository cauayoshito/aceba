import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { FALLBACK_NEWS } from '@/lib/fallback-news'
import type { NewsItem } from '@/lib/types'
import '../../site.css'
import './noticia.css'

function formatNewsDate(dateStr?: string | null) {
  if (!dateStr) return ''
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
}

async function getNews(id: string): Promise<NewsItem | null> {
  // Conteúdo de demonstração (quando a tabela está vazia)
  const fallback = FALLBACK_NEWS.find((n) => n.id === id)
  if (fallback) return fallback

  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('news')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .single()
    return (data as NewsItem) ?? null
  } catch {
    return null
  }
}

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params
  const news = await getNews(id)
  if (!news) return { title: 'Notícia não encontrada · ACEBA' }
  return {
    title: `${news.title} · ACEBA`,
    description: news.excerpt ?? undefined,
    openGraph: {
      title: news.title,
      description: news.excerpt ?? undefined,
      images: news.cover_url ? [news.cover_url] : undefined,
      type: 'article',
    },
  }
}

export default async function NoticiaPage(
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const news = await getNews(id)
  if (!news) notFound()

  const body = news.content?.trim() || news.excerpt?.trim() || ''
  const paragraphs = body.split(/\n\s*\n/).filter(Boolean)

  return (
    <main className="article-page">
      <article className="article">
        <div className="article-container">
          <Link href="/#noticias" className="article-back">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
            </svg>
            Voltar para as notícias
          </Link>

          {news.category && <span className="article-cat">{news.category}</span>}
          <h1 className="article-title">{news.title}</h1>
          {news.published_at && (
            <time className="article-date" dateTime={news.published_at}>
              {formatNewsDate(news.published_at)}
            </time>
          )}
        </div>

        {news.cover_url && (
          <div className="article-hero">
            <img src={news.cover_url} alt={news.title} />
          </div>
        )}

        <div className="article-container">
          <div className="article-body">
            {paragraphs.length > 0 ? (
              paragraphs.map((p, i) => <p key={i}>{p}</p>)
            ) : (
              <p>{news.title}</p>
            )}
          </div>

          {(() => {
            const docs = (news.documents && news.documents.length > 0)
              ? news.documents
              : (news.doc_url ? [{ label: news.doc_label?.trim() || 'Baixar documento', url: news.doc_url }] : [])
            if (docs.length === 0) return null
            return (
              <div className="article-doc">
                <p className="article-doc-title">Documentos da parceria</p>
                {docs.map((doc, i) => (
                  <a key={i} href={doc.url} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    {doc.label?.trim() || 'Baixar documento'}
                  </a>
                ))}
              </div>
            )
          })()}

          {news.link_url && (
            <div className="article-source">
              <a href={news.link_url} target="_blank" rel="noopener noreferrer" className="btn btn-dark">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="2" y="2" width="20" height="20" rx="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
                Ver publicação original no Instagram
              </a>
            </div>
          )}

          <div className="article-foot">
            <Link href="/#noticias" className="btn btn-ghost-light">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
              </svg>
              Voltar para todas as notícias
            </Link>
          </div>
        </div>
      </article>
    </main>
  )
}

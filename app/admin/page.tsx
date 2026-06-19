import { redirect } from 'next/navigation'
import { getAdminUser } from '@/lib/admin/auth'
import { createClient } from '@/lib/supabase/server'
import AdminSidebar from '@/components/admin/Sidebar'
import DashboardClient from './DashboardClient'

export default async function AdminPage() {
  const { user, isAdmin } = await getAdminUser()

  if (!user) redirect('/admin/login')

  // User logged in but not in admin_users
  if (!isAdmin) {
    return (
      <body className="admin-page">
        <div className="admin-shell" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f9fafb' }}>
          <div style={{ maxWidth: 480, padding: '2rem', background: '#fff', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', textAlign: 'center' }}>
            <img src="/logos/aceba.png" alt="ACEBA" style={{ height: 56, marginBottom: '1.5rem' }} />
            <div style={{ background: '#FFF3CD', border: '1px solid #FBBF24', borderRadius: '8px', padding: '1rem', marginBottom: '1.5rem' }}>
              <strong style={{ color: '#92400E' }}>⚠️ Usuário não autorizado como administrador</strong>
            </div>
            <p style={{ color: '#6B7280', marginBottom: '1rem' }}>
              Você está autenticado, mas seu usuário ainda não está cadastrado como administrador da ACEBA.
            </p>
            <div style={{ background: '#F3F4F6', borderRadius: '8px', padding: '1rem', textAlign: 'left', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
              <p style={{ margin: '0 0 0.5rem', fontWeight: 600 }}>Dados do usuário:</p>
              <p style={{ margin: '0 0 0.25rem' }}>ID: <code style={{ fontSize: '0.75rem', background: '#E5E7EB', padding: '0 4px', borderRadius: 4 }}>{user.id}</code></p>
              <p style={{ margin: 0 }}>E-mail: <strong>{user.email}</strong></p>
            </div>
            <p style={{ color: '#6B7280', fontSize: '0.85rem', marginBottom: '1rem' }}>
              Para liberar acesso, execute no SQL Editor do Supabase:
            </p>
            <pre style={{ background: '#1E293B', color: '#E2E8F0', padding: '1rem', borderRadius: '8px', fontSize: '0.75rem', textAlign: 'left', overflow: 'auto', marginBottom: '1.5rem' }}>
{`insert into public.admin_users (id, email)
select id, email
from auth.users
where email = '${user.email}'
on conflict (id) do update
  set email = excluded.email;`}
            </pre>
            <a href="/admin/login" style={{ display: 'inline-block', padding: '0.75rem 1.5rem', background: '#009B3A', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontWeight: 600 }}>
              Voltar ao login
            </a>
          </div>
        </div>
      </body>
    )
  }

  // Get counts
  const supabase = await createClient()
  const [{ count: partnersCount }, { count: newsCount }, { count: galleryCount }] = await Promise.all([
    supabase.from('partners').select('*', { count: 'exact', head: true }),
    supabase.from('news').select('*', { count: 'exact', head: true }),
    supabase.from('gallery_images').select('*', { count: 'exact', head: true }),
  ])

  return (
    <body className="admin-page">
      <div className="admin-shell">
        <AdminSidebar userEmail={user.email} />
        <DashboardClient
          userEmail={user.email ?? ''}
          partnersCount={partnersCount ?? 0}
          newsCount={newsCount ?? 0}
          galleryCount={galleryCount ?? 0}
        />
      </div>
    </body>
  )
}

import { redirect } from 'next/navigation'
import { getAdminUser } from '@/lib/admin/auth'
import { createClient } from '@/lib/supabase/server'
import AdminSidebar from '@/components/admin/Sidebar'
import NoticiasClient from './NoticiasClient'
import type { NewsItem } from '@/lib/types'

export default async function NoticiasPage() {
  const { user, isAdmin } = await getAdminUser()
  if (!user) redirect('/admin/login')
  if (!isAdmin) redirect('/admin')

  const supabase = await createClient()
  const { data: news } = await supabase
    .from('news')
    .select('*')
    .order('published_at', { ascending: false })
    .order('created_at', { ascending: false })

  return (
    <body className="admin-page">
      <div className="admin-shell">
        <AdminSidebar userEmail={user.email} />
        <NoticiasClient news={(news as NewsItem[]) ?? []} />
      </div>
    </body>
  )
}

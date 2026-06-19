import { redirect } from 'next/navigation'
import { getAdminUser } from '@/lib/admin/auth'
import { createClient } from '@/lib/supabase/server'
import AdminSidebar from '@/components/admin/Sidebar'
import ConfiguracoesClient from './ConfiguracoesClient'
import type { SiteSetting } from '@/lib/types'

export default async function ConfiguracoesPage() {
  const { user, isAdmin } = await getAdminUser()
  if (!user) redirect('/admin/login')
  if (!isAdmin) redirect('/admin')

  const supabase = await createClient()
  const { data: settings } = await supabase.from('site_settings').select('*')

  const settingsMap: Record<string, string> = {}
  ;(settings as SiteSetting[] | null)?.forEach(s => {
    settingsMap[s.key] = s.value || ''
  })

  return (
    <body className="admin-page">
      <div className="admin-shell">
        <AdminSidebar userEmail={user.email} />
        <ConfiguracoesClient settings={settingsMap} />
      </div>
    </body>
  )
}

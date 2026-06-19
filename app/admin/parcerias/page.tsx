import { redirect } from 'next/navigation'
import { getAdminUser } from '@/lib/admin/auth'
import { createClient } from '@/lib/supabase/server'
import AdminSidebar from '@/components/admin/Sidebar'
import ParcelasClient from './ParcelasClient'
import type { Partner } from '@/lib/types'

export default async function ParcelasPage() {
  const { user, isAdmin } = await getAdminUser()
  if (!user) redirect('/admin/login')
  if (!isAdmin) redirect('/admin')

  const supabase = await createClient()
  const { data: partners } = await supabase
    .from('partners')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true })

  return (
    <body className="admin-page">
      <div className="admin-shell">
        <AdminSidebar userEmail={user.email} />
        <ParcelasClient partners={(partners as Partner[]) ?? []} />
      </div>
    </body>
  )
}

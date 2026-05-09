import { redirect } from 'next/navigation'
import { getAdminUser } from '@/lib/admin/auth'
import { createClient } from '@/lib/supabase/server'
import AdminSidebar from '@/components/admin/Sidebar'
import GaleriaClient from './GaleriaClient'
import type { GalleryImage } from '@/lib/types'

export default async function GaleriaPage() {
  const { user, isAdmin } = await getAdminUser()
  if (!user) redirect('/admin/login')
  if (!isAdmin) redirect('/admin')

  const supabase = await createClient()
  const { data: images } = await supabase
    .from('gallery_images')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <body className="admin-page">
      <div className="admin-shell">
        <AdminSidebar userEmail={user.email} />
        <GaleriaClient images={(images as GalleryImage[]) ?? []} />
      </div>
    </body>
  )
}

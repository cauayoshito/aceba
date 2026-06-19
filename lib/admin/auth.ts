import { createClient } from '@/lib/supabase/server'

export async function getAdminUser() {
  const supabase = await createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) return { user: null, isAdmin: false }

  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('id, email')
    .eq('id', user.id)
    .single()

  return {
    user,
    isAdmin: Boolean(adminUser),
    adminUser,
  }
}

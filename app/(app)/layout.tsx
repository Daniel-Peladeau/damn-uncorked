import { AppLayout } from '@/components/layout/AppLayout'
import { createClient } from '@/lib/supabase/server'

export default async function AppGroupLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return <AppLayout userEmail={user?.email ?? null}>{children}</AppLayout>
}

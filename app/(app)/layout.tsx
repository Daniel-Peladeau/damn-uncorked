import { AppLayout } from '@/components/layout/AppLayout'
import { getCurrentUser } from '@/lib/supabase/server'

export default async function AppGroupLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()

  return <AppLayout userEmail={user?.email ?? null}>{children}</AppLayout>
}

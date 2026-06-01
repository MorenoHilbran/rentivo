import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SuperAdminSidebar from './SuperAdminSidebar'

export default async function SuperAdminLayout({ children }) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  const role = session.user.user_metadata?.role
  if (role !== 'superadmin') {
    redirect('/dashboard')
  }

  return (
    <div className="app-shell">
      <SuperAdminSidebar
        user={{
          name: session.user.user_metadata?.name ?? session.user.email,
          email: session.user.email,
        }}
      />
      <main className="main-content">
        {children}
      </main>
    </div>
  )
}

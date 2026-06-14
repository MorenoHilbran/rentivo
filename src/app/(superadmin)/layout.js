import { requireSuperAdmin } from '@/lib/session'
import SuperAdminSidebar from './SuperAdminSidebar'

export default async function SuperAdminLayout({ children }) {
  const user = await requireSuperAdmin()

  return (
    <div className="app-shell">
      <SuperAdminSidebar
        user={{
          name: user.user_metadata?.name ?? user.email,
          email: user.email,
        }}
      />
      <main className="main-content">
        {children}
      </main>
    </div>
  )
}

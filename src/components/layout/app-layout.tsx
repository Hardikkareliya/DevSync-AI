import { Outlet, Navigate } from 'react-router-dom'
import { Sidebar } from './sidebar'
import { useAuthStore } from '@/store/auth-store'
import { useMobile } from '@/hooks/use-mobile'
import { cn } from '@/lib/utils'
import { Toaster } from 'react-hot-toast'

export function AppLayout() {
  const { user, isLoading } = useAuthStore()
  const isMobile = useMobile()

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1" style={{ paddingLeft: 'var(--sidebar-width, 240px)' }}>
        <div className={cn('mx-auto max-w-6xl p-6', isMobile && 'pb-20')}>
          <Outlet />
        </div>
      </main>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: 'var(--card)',
            color: 'var(--card-foreground)',
            border: '1px solid var(--border)',
            borderRadius: '0.75rem',
            fontSize: '0.875rem',
          },
          duration: 3000,
        }}
      />
    </div>
  )
}
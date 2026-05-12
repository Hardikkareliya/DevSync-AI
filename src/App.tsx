import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryProvider } from '@/providers/query-provider'
import { ThemeProvider } from '@/providers/theme-provider'
import { AppLayout } from '@/components/layout/app-layout'
import { LoginPage } from '@/pages/auth/login'
import { RegisterPage } from '@/pages/auth/register'
import { DashboardPage } from '@/pages/dashboard/dashboard'
import { ProjectsPage } from '@/pages/projects/projects'
import { ReportsPage } from '@/pages/reports/reports'
import { CommitsPage } from '@/pages/commits/commits'
import { PrPage } from '@/pages/pr/pr'
import { HistoryPage } from '@/pages/history/history'
import { SettingsPage } from '@/pages/settings/settings'
import { useAuthStore } from '@/store/auth-store'
import { supabase } from '@/integrations/supabase/client'

function SessionLoader({ children }: { children: React.ReactNode }) {
  const { setUser, setLoading, isLoading } = useAuthStore()

  useEffect(() => {
    async function init() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          setUser({ id: user.id, email: user.email!, created_at: user.created_at })
        } else {
          setLoading(false)
        }
      } catch {
        setLoading(false)
      }
    }
    init()
  }, [setUser, setLoading])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  return <>{children}</>
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <QueryProvider>
          <SessionLoader>
            <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/projects" element={<ProjectsPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/commits" element={<CommitsPage />} />
              <Route path="/pr" element={<PrPage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
          </SessionLoader>
        </QueryProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}

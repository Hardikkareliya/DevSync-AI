import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  FileText,
  GitCommit,
  GitPullRequest,
  History,
  Settings,
  LogOut,
  SquareDashedKanban,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/auth-store'
import { supabase } from '@/integrations/supabase/client'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useMobile } from '@/hooks/use-mobile'
import { useState, useEffect } from 'react'
import { useProjectStore } from '@/store/project-store'

const navGroups = [
  {
    label: 'Workspace',
    items: [
      { icon: LayoutDashboard, label: 'Dashboard', to: '/dashboard' },
      { icon: SquareDashedKanban, label: 'Projects', to: '/projects' },
    ],
  },
  {
    label: 'Generate',
    items: [
      { icon: FileText, label: 'Reports', to: '/reports' },
      { icon: GitCommit, label: 'Commits', to: '/commits' },
      { icon: GitPullRequest, label: 'PRs', to: '/pr' },
    ],
  },
  {
    label: 'History',
    items: [
      { icon: History, label: 'History', to: '/history' },
    ],
  },
  {
    label: 'Settings',
    items: [
      { icon: Settings, label: 'Settings', to: '/settings' },
    ],
  },
]

export function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, setUser } = useAuthStore()
  const isMobile = useMobile()
  const [collapsed, setCollapsed] = useState(false)
  const activeProject = useProjectStore((s) =>
    s.activeProjectId ? s.projects.find((p) => p.id === s.activeProjectId) : null
  )

  useEffect(() => {
    document.documentElement.style.setProperty('--sidebar-width', collapsed ? '68px' : '240px')
  }, [collapsed])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    navigate('/login')
  }

  if (isMobile) {
    return (
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur-lg">
        <div className="flex items-center justify-around p-1.5">
          {navGroups.flatMap((g) => g.items).map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center gap-0.5 rounded-lg p-1.5 text-[10px] font-medium transition-all duration-200',
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                )
              }
            >
              <item.icon className="h-4 w-4" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    )
  }

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 flex h-screen flex-col border-r bg-background/90 backdrop-blur-xl transition-all duration-300',
        collapsed ? 'w-[68px]' : 'w-60'
      )}
    >
      {/* Logo */}
      <div className={cn(
        'flex h-16 items-center border-b border-border/50',
        collapsed ? 'justify-center px-0' : 'gap-3 px-5'
      )}>
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/60 shadow-lg shadow-primary/20">
          <Sparkles className="h-4 w-4 text-primary-foreground" />
        </div>
        {!collapsed && (
          <>
            <div className="flex flex-col">
              <span className="text-sm font-semibold tracking-tight">DevSync</span>
              <span className="text-[10px] text-muted-foreground">AI Productivity</span>
            </div>
            <button
              onClick={() => setCollapsed(true)}
              className="ml-auto rounded-lg p-1.5 text-muted-foreground/60 opacity-0 transition-all duration-200 hover:bg-accent hover:text-foreground group-hover/sidebar:opacity-100"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
          </>
        )}
        {collapsed && (
          <button
            onClick={() => setCollapsed(false)}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Active Project */}
      {activeProject && !collapsed && (
        <div className="mx-3 mt-3 rounded-lg border border-border/50 bg-muted/30 px-3 py-2.5">
          <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/70">
            Active Project
          </p>
          <div className="mt-0.5 flex items-center gap-2">
            <div className="flex h-5 w-5 items-center justify-center rounded-md bg-primary/10 text-[10px] font-bold text-primary">
              {activeProject.name.charAt(0).toUpperCase()}
            </div>
            <p className="truncate text-sm font-medium">{activeProject.name}</p>
          </div>
        </div>
      )}

      {/* Nav */}
      <TooltipProvider delayDuration={0}>
        <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4 scrollbar-none">
          {navGroups.map((group) => (
            <div key={group.label}>
              {!collapsed && (
                <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/50">
                  {group.label}
                </p>
              )}
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = location.pathname === item.to
                  return (
                    <Tooltip key={item.to}>
                      <TooltipTrigger asChild>
                        <NavLink
                          to={item.to}
                          className={cn(
                            'group relative flex items-center rounded-lg text-sm font-medium transition-all duration-200',
                            collapsed ? 'justify-center px-0 py-2.5' : 'gap-3 px-3 py-2.5',
                            isActive
                              ? 'bg-primary/10 text-primary'
                              : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                          )}
                        >
                          {isActive && (
                            <span className={cn(
                              'absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-full bg-primary',
                              collapsed ? 'hidden' : 'block'
                            )} />
                          )}
                          <div className={cn(
                            'flex items-center justify-center rounded-lg transition-all duration-200',
                            isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                          )}>
                            <item.icon className="h-4 w-4" />
                          </div>
                          {!collapsed && <span>{item.label}</span>}
                          {!collapsed && isActive && (
                            <span className="ml-auto rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                              Active
                            </span>
                          )}
                        </NavLink>
                      </TooltipTrigger>
                      {collapsed && (
                        <TooltipContent side="right" className="text-xs">
                          {item.label}
                        </TooltipContent>
                      )}
                    </Tooltip>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>
      </TooltipProvider>

      {/* Bottom */}
      <div className="border-t border-border/50 p-3">
        {!collapsed && user && (
          <div className="mb-2 rounded-lg px-3 py-2 text-xs text-muted-foreground/80">
            <p className="truncate font-medium text-foreground/80">{user.email}</p>
          </div>
        )}
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size={collapsed ? 'icon' : 'default'}
                className={cn(
                  'w-full gap-2.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-200',
                  collapsed ? 'justify-center h-10 w-10' : 'justify-start px-3'
                )}
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 shrink-0" />
                {!collapsed && <span className="text-sm">Sign out</span>}
              </Button>
            </TooltipTrigger>
            {collapsed && <TooltipContent side="right" className="text-xs">Sign out</TooltipContent>}
          </Tooltip>
        </TooltipProvider>
      </div>
    </aside>
  )
}

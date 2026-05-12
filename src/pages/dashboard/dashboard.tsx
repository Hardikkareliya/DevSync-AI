import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/store/auth-store'
import { fetchDashboardStats } from '@/integrations/supabase/queries'
import { fetchProjects } from '@/integrations/supabase/queries'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { FileText, GitCommit, GitPullRequest, TrendingUp, Sparkles, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { useProjectStore } from '@/store/project-store'

const quickActions = [
  { icon: FileText, label: 'Generate Report', to: '/reports', color: 'text-blue-500' },
  { icon: GitCommit, label: 'Generate Commit', to: '/commits', color: 'text-emerald-500' },
  { icon: GitPullRequest, label: 'Generate PR', to: '/pr', color: 'text-purple-500' },
]

export function DashboardPage() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const { projects, setProjects } = useProjectStore()

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats', user?.id],
    queryFn: () => fetchDashboardStats(user!.id),
    enabled: !!user,
  })

  const { isLoading: projectsLoading } = useQuery({
    queryKey: ['projects', user?.id],
    queryFn: async () => {
      const data = await fetchProjects(user!.id)
      setProjects(data)
      return data
    },
    enabled: !!user,
  })

  const statCards = [
    {
      icon: FileText,
      label: 'Reports',
      total: stats?.total_reports || 0,
      weekly: stats?.weekly_reports || 0,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
    },
    {
      icon: GitCommit,
      label: 'Commits',
      total: stats?.total_commits || 0,
      weekly: stats?.weekly_commits || 0,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
    },
    {
      icon: GitPullRequest,
      label: 'PR Descriptions',
      total: stats?.total_prs || 0,
      weekly: stats?.weekly_prs || 0,
      color: 'text-purple-500',
      bg: 'bg-purple-500/10',
    },
  ]

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Welcome back, {user?.email?.split('@')[0]}
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="grid gap-4 sm:grid-cols-3"
      >
        {statCards.map((stat) => (
          <Card key={stat.label} className="transition-all duration-200 hover:shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className={`rounded-lg ${stat.bg} p-2.5`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </div>
              <div className="mt-4">
                {statsLoading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <p className="text-2xl font-bold">{stat.total}</p>
                )}
                <p className="text-sm text-muted-foreground">Total {stat.label}</p>
              </div>
              <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3" />
                <span>{stat.weekly} this week</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="grid gap-6 lg:grid-cols-2"
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {quickActions.map((action) => (
              <button
                key={action.to}
                onClick={() => navigate(action.to)}
                className="flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-all duration-200 hover:bg-accent hover:shadow-sm"
              >
                <div className="rounded-lg bg-muted p-2">
                  <action.icon className={`h-4 w-4 ${action.color}`} />
                </div>
                <span className="flex-1 text-sm font-medium">{action.label}</span>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Projects</CardTitle>
          </CardHeader>
          <CardContent>
            {projectsLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : projects.length === 0 ? (
              <div className="flex flex-col items-center py-6 text-center">
                <Sparkles className="mb-2 h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">No projects yet</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => navigate('/projects')}
                >
                  Create your first project
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {projects.slice(0, 5).map((project) => (
                  <div
                    key={project.id}
                    className="flex items-center gap-3 rounded-lg border p-3"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                      {project.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{project.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Created {new Date(project.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
                {projects.length > 5 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full"
                    onClick={() => navigate('/projects')}
                  >
                    View all ({projects.length})
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

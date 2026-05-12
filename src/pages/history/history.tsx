import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/store/auth-store'
import { useProjectStore } from '@/store/project-store'
import { fetchReports, fetchCommits, fetchPrs, deleteReport, deleteCommit, deletePr } from '@/integrations/supabase/queries'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { CopyButton } from '@/components/shared/copy-button'
import { EmptyState } from '@/components/shared/empty-state'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { HistoryIcon, FileText, GitCommit, GitPullRequest, Search, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

type FilterType = 'all' | 'report' | 'commit' | 'pr'

export function HistoryPage() {
  const { user } = useAuthStore()
  const { activeProjectId } = useProjectStore()
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<FilterType>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [deleteItem, setDeleteItem] = useState<{ id: string; type: string } | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['history', user?.id, activeProjectId],
    queryFn: async () => {
      const [reports, commits, prs] = await Promise.all([
        fetchReports(user!.id, activeProjectId || undefined),
        fetchCommits(user!.id, activeProjectId || undefined),
        fetchPrs(user!.id, activeProjectId || undefined),
      ])

      const all = [
        ...reports.map((r) => ({ ...r, itemType: 'report' as const })),
        ...commits.map((c) => ({ ...c, itemType: 'commit' as const })),
        ...prs.map((p) => ({ ...p, itemType: 'pr' as const })),
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

      return all
    },
    enabled: !!user,
  })

  const deleteMutation = useMutation({
    mutationFn: async ({ id, type }: { id: string; type: string }) => {
      switch (type) {
        case 'report': return deleteReport(id)
        case 'commit': return deleteCommit(id)
        case 'pr': return deletePr(id)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['history'] })
      setDeleteItem(null)
      toast.success('Deleted successfully')
    },
    onError: () => toast.error('Failed to delete'),
  })

  const filtered = (data || []).filter((item) => {
    if (filterType !== 'all' && item.itemType !== filterType) return false
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      return (
        item.raw_input.toLowerCase().includes(q) ||
        item.generated_output.toLowerCase().includes(q)
      )
    }
    return true
  })

  const getIcon = (type: string) => {
    switch (type) {
      case 'report': return FileText
      case 'commit': return GitCommit
      case 'pr': return GitPullRequest
      default: return FileText
    }
  }

  const getBadge = (type: string) => {
    switch (type) {
      case 'report': return { label: 'Report', variant: 'default' as const }
      case 'commit': return { label: 'Commit', variant: 'secondary' as const }
      case 'pr': return { label: 'PR', variant: 'outline' as const }
      default: return { label: 'Report', variant: 'default' as const }
    }
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold tracking-tight">History</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Browse and manage all your generated content
        </p>
      </motion.div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search history..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={filterType} onValueChange={(v) => setFilterType(v as FilterType)}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="report">Reports</SelectItem>
            <SelectItem value="commit">Commits</SelectItem>
            <SelectItem value="pr">PRs</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="mt-2 h-3 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={HistoryIcon}
          title="No history"
          description={searchQuery ? 'No results match your search' : 'Generate some content to see it here'}
        />
      ) : (
        <div className="space-y-2">
          {filtered.map((item, i) => {
            const Icon = getIcon(item.itemType)
            const badge = getBadge(item.itemType)
            const isExpanded = expandedId === `${item.itemType}-${item.id}`

            return (
              <motion.div
                key={`${item.itemType}-${item.id}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
              >
                <Card className="transition-all duration-200 hover:shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : `${item.itemType}-${item.id}`)}>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                          <Badge variant={badge.variant}>{badge.label}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(item.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                          {item.raw_input}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <CopyButton text={item.generated_output} />
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => setDeleteItem({ id: item.id, type: item.itemType })}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={() => setExpandedId(isExpanded ? null : `${item.itemType}-${item.id}`)}
                        >
                          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-3 border-t pt-3"
                      >
                        <pre className="whitespace-pre-wrap text-sm text-muted-foreground">
                          {item.generated_output}
                        </pre>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      )}

      <Dialog open={!!deleteItem} onOpenChange={() => setDeleteItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Item</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteItem(null)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => deleteItem && deleteMutation.mutate(deleteItem)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

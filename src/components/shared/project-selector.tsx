import { useNavigate } from 'react-router-dom'
import { useProjectStore } from '@/store/project-store'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export function ProjectSelector() {
  const navigate = useNavigate()
  const { projects, activeProjectId, setActiveProjectId } = useProjectStore()

  if (projects.length === 0) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-dashed p-3 text-sm text-muted-foreground">
        <span>No projects yet</span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/projects')}
          className="gap-1"
        >
          <Plus className="h-3 w-3" />
          Create one
        </Button>
      </div>
    )
  }

  return (
    <Select
      value={activeProjectId || undefined}
      onValueChange={(v) => setActiveProjectId(v)}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select a project..." />
      </SelectTrigger>
      <SelectContent>
        {projects.map((p) => (
          <SelectItem key={p.id} value={p.id}>
            {p.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

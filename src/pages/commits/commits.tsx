import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useAuthStore } from '@/store/auth-store'
import { useProjectStore } from '@/store/project-store'
import { useSettingsStore, getApiKey } from '@/store/settings-store'
import { generateWithAI } from '@/features/ai/ai.service'
import { saveCommit } from '@/integrations/supabase/queries'
import { GeneratorLayout } from '@/components/shared/generator-layout'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { CopyButton } from '@/components/shared/copy-button'
import { Badge } from '@/components/ui/badge'
import { LoadingSpinner } from '@/components/shared/loading-spinner'
import { ProjectSelector } from '@/components/shared/project-selector'
import { GitCommit, Wand2 } from 'lucide-react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

export function CommitsPage() {
  const { user } = useAuthStore()
  const { activeProjectId } = useProjectStore()
  const { aiProvider } = useSettingsStore()
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')

  const generateMutation = useMutation({
    mutationFn: async () => {
      const apiKey = getApiKey()
      return generateWithAI('commit', input, aiProvider, apiKey)
    },
    onSuccess: async (result) => {
      setOutput(result)
      if (user && activeProjectId) {
        try {
          const commitType = result.match(/^(feat|fix|refactor|docs|chore|perf|style)/)?.[1] || 'chore'
          await saveCommit({
            user_id: user.id,
            project_id: activeProjectId,
            raw_input: input,
            generated_output: result,
            commit_type: commitType,
            output_format: 'plain',
            provider: aiProvider,
          })
        } catch {}
      }
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to generate commit message')
    },
  })

  const handleGenerate = () => {
    if (!input.trim()) {
      toast.error('Please enter your changes first')
      return
    }
    if (!getApiKey()) {
      toast.error('Please configure your API key in Settings or .env file')
      return
    }
    if (!activeProjectId) {
      toast.error('Please select or create a project first')
      return
    }
    generateMutation.mutate()
  }

  return (
    <GeneratorLayout
      title="Commit Message Generator"
      description="Generate professional conventional git commit messages from your changes"
      inputSection={
        <div className="space-y-4">
          <ProjectSelector />
          <div className="space-y-2">
            <label className="text-sm font-medium">Describe Your Changes</label>
            <Textarea
              placeholder={`fixed login validation bug\nadded user profile page\nupdated api error handling`}
              className="min-h-[200px] resize-none font-mono text-sm"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
          </div>
          <Button
            onClick={handleGenerate}
            disabled={generateMutation.isPending || !input.trim()}
            className="gap-2"
          >
            {generateMutation.isPending ? (
              <LoadingSpinner size="sm" />
            ) : (
              <Wand2 className="h-4 w-4" />
            )}
            {generateMutation.isPending ? 'Generating...' : 'Generate Commit'}
          </Button>
        </div>
      }
      outputSection={
        output ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GitCommit className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Generated</span>
              </div>
              <CopyButton text={output} />
            </div>
            <div className="rounded-lg border bg-muted/50 p-4 font-mono text-sm">
              {output.split('\n').map((line, i) => {
                const isPrimary = line.startsWith('Primary:')
                const isAlt = line.startsWith('Alternative:')
                const content = line.replace(/^(Primary:|Alternative:)\s*/, '')

                if (isPrimary || isAlt) {
                  const type = content.match(/^(feat|fix|refactor|docs|chore|perf|style)/)?.[1]
                  return (
                    <div key={i} className="mb-2">
                      <span className="text-xs uppercase text-muted-foreground">
                        {isPrimary ? 'Primary' : 'Alternative'}
                      </span>
                      <div className="mt-1 flex items-center gap-2">
                        {type && (
                          <Badge variant={
                            type === 'feat' ? 'success' :
                            type === 'fix' ? 'destructive' :
                            type === 'refactor' ? 'warning' : 'secondary'
                          }>
                            {type}
                          </Badge>
                        )}
                        <span className="text-foreground">{content}</span>
                      </div>
                    </div>
                  )
                }
                return <p key={i} className="text-muted-foreground">{line}</p>
              })}
            </div>
          </motion.div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <GitCommit className="mb-2 h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Your commit messages will appear here
            </p>
          </div>
        )
      }
    />
  )
}

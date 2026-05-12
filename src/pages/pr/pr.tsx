import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useAuthStore } from '@/store/auth-store'
import { useProjectStore } from '@/store/project-store'
import { useSettingsStore, getApiKey } from '@/store/settings-store'
import { generateWithAI } from '@/features/ai/ai.service'
import { savePr } from '@/integrations/supabase/queries'
import { GeneratorLayout } from '@/components/shared/generator-layout'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { CopyButton } from '@/components/shared/copy-button'
import { OutputFormatSelector } from '@/components/shared/output-format-selector'
import { LoadingSpinner } from '@/components/shared/loading-spinner'
import { ProjectSelector } from '@/components/shared/project-selector'
import { GitPullRequest, Wand2 } from 'lucide-react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

export function PrPage() {
  const { user } = useAuthStore()
  const { activeProjectId } = useProjectStore()
  const { defaultFormat, aiProvider } = useSettingsStore()
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [format, setFormat] = useState(defaultFormat)

  const generateMutation = useMutation({
    mutationFn: async () => {
      const apiKey = getApiKey()
      return generateWithAI('pr', input, aiProvider, apiKey, format)
    },
    onSuccess: async (result) => {
      setOutput(result)
      if (user && activeProjectId) {
        try {
          await savePr({
            user_id: user.id,
            project_id: activeProjectId,
            raw_input: input,
            generated_output: result,
            output_format: format,
            provider: aiProvider,
          })
        } catch {}
      }
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to generate PR description')
    },
  })

  const handleGenerate = () => {
    if (!input.trim()) {
      toast.error('Please describe your changes first')
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
      title="PR Description Generator"
      description="Generate comprehensive pull request descriptions from your development notes"
      inputSection={
        <div className="space-y-4">
          <ProjectSelector />
          <div className="space-y-2">
            <label className="text-sm font-medium">Describe Your Changes</label>
            <Textarea
              placeholder={`Added user authentication with JWT\nImplemented profile page\nFixed logout redirect bug\nUpdated API error messages`}
              className="min-h-[200px] resize-none font-mono text-sm"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <OutputFormatSelector value={format} onChange={setFormat} />
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
              {generateMutation.isPending ? 'Generating...' : 'Generate PR'}
            </Button>
          </div>
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
              <span className="text-xs text-muted-foreground">AI Generated</span>
              <CopyButton text={output} />
            </div>
            <div className="rounded-lg border bg-muted/50 p-4">
              <div className="prose prose-sm dark:prose-invert max-w-none">
                {output.split('\n').map((line, i) => {
                  if (line.startsWith('## ')) {
                    return <h2 key={i} className="mt-4 mb-2 text-base font-semibold first:mt-0">{line.replace('## ', '')}</h2>
                  }
                  if (line.startsWith('- ')) {
                    return <li key={i} className="ml-4 text-sm text-muted-foreground">{line.replace('- ', '')}</li>
                  }
                  if (line.startsWith('### ')) {
                    return <h3 key={i} className="mt-3 mb-1 text-sm font-medium">{line.replace('### ', '')}</h3>
                  }
                  if (!line.trim()) return <br key={i} />
                  return <p key={i} className="text-sm text-muted-foreground">{line}</p>
                })}
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <GitPullRequest className="mb-2 h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Your PR description will appear here
            </p>
          </div>
        )
      }
    />
  )
}

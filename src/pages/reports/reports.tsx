import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useAuthStore } from '@/store/auth-store'
import { useProjectStore } from '@/store/project-store'
import { useSettingsStore, getApiKey } from '@/store/settings-store'
import { generateWithAI } from '@/features/ai/ai.service'
import { saveReport } from '@/integrations/supabase/queries'
import { GeneratorLayout } from '@/components/shared/generator-layout'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { CopyButton } from '@/components/shared/copy-button'
import { OutputFormatSelector } from '@/components/shared/output-format-selector'
import { LoadingSpinner } from '@/components/shared/loading-spinner'
import { ProjectSelector } from '@/components/shared/project-selector'
import { Sparkles, Wand2 } from 'lucide-react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

export function ReportsPage() {
  const { user } = useAuthStore()
  const { activeProjectId } = useProjectStore()
  const { defaultFormat, aiProvider } = useSettingsStore()
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [format, setFormat] = useState(defaultFormat)

  const generateMutation = useMutation({
    mutationFn: async () => {
      const apiKey = getApiKey()
      const result = await generateWithAI('report', input, aiProvider, apiKey, format)
      return result
    },
    onSuccess: async (result) => {
      setOutput(result)
      if (user && activeProjectId) {
        try {
          await saveReport({
            user_id: user.id,
            project_id: activeProjectId,
            raw_input: input,
            generated_output: result,
            output_format: format,
            provider: aiProvider,
          })
        } catch {
          // Silently fail on save
        }
      }
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to generate report')
    },
  })

  const handleGenerate = () => {
    if (!input.trim()) {
      toast.error('Please enter your tasks first')
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
      title="Daily Report Generator"
      description="Convert your rough development notes into professional daily progress reports"
      inputSection={
        <div className="space-y-4">
          <ProjectSelector />
          <div className="space-y-2">
            <label className="text-sm font-medium">Development Notes</label>
            <Textarea
              placeholder={`+ completed login ui\n+ fixed auth api\n~ working on dashboard\n- pending notification integration`}
              className="min-h-[200px] resize-none font-mono text-sm"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Use + for completed, ~ for in-progress, - for pending
            </p>
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
              {generateMutation.isPending ? 'Generating...' : 'Generate Report'}
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
              <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                {output}
              </pre>
            </div>
          </motion.div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Sparkles className="mb-2 h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Your generated report will appear here
            </p>
          </div>
        )
      }
    />
  )
}

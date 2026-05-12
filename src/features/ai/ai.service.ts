import { generateWithGemini } from './providers/gemini.provider'
import { generateWithOpenAI } from './providers/openai.provider'
import { getReportPrompt } from './prompts/report.prompt'
import { getCommitPrompt } from './prompts/commit.prompt'
import { getPrPrompt } from './prompts/pr.prompt'
import type { AiProvider, OutputFormat } from '@/types'

export type GenerationType = 'report' | 'commit' | 'pr'

export async function generateWithAI(
  type: GenerationType,
  input: string,
  provider: AiProvider,
  apiKey: string,
  format: OutputFormat = 'markdown'
): Promise<string> {
  let prompt: string

  switch (type) {
    case 'report':
      prompt = getReportPrompt(input, format)
      break
    case 'commit':
      prompt = getCommitPrompt(input)
      break
    case 'pr':
      prompt = getPrPrompt(input, format)
      break
  }

  switch (provider) {
    case 'gemini':
      return generateWithGemini(prompt, apiKey)
    case 'openai':
      return generateWithOpenAI(prompt, apiKey)
    default:
      throw new Error(`Unsupported AI provider: ${provider}`)
  }
}

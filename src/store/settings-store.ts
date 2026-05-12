import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { OutputFormat, AiProvider } from '@/types'

interface SettingsState {
  defaultFormat: OutputFormat
  aiProvider: AiProvider
  geminiApiKey: string
  openaiApiKey: string
  setDefaultFormat: (format: OutputFormat) => void
  setAiProvider: (provider: AiProvider) => void
  setGeminiApiKey: (key: string) => void
  setOpenaiApiKey: (key: string) => void
}

function getInitialGeminiKey(): string {
  const fromEnv = import.meta.env.VITE_GEMINI_API_KEY
  const fromStorage = typeof window !== 'undefined'
    ? JSON.parse(localStorage.getItem('devsync-settings') || '{}')?.state?.geminiApiKey
    : ''
  return fromStorage || fromEnv || ''
}

function getInitialOpenaiKey(): string {
  const fromEnv = import.meta.env.VITE_OPENAI_API_KEY
  const fromStorage = typeof window !== 'undefined'
    ? JSON.parse(localStorage.getItem('devsync-settings') || '{}')?.state?.openaiApiKey
    : ''
  return fromStorage || fromEnv || ''
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      defaultFormat: 'markdown',
      aiProvider: 'gemini',
      geminiApiKey: getInitialGeminiKey(),
      openaiApiKey: getInitialOpenaiKey(),
      setDefaultFormat: (defaultFormat) => set({ defaultFormat }),
      setAiProvider: (aiProvider) => set({ aiProvider }),
      setGeminiApiKey: (geminiApiKey) => set({ geminiApiKey }),
      setOpenaiApiKey: (openaiApiKey) => set({ openaiApiKey }),
    }),
    {
      name: 'devsync-settings',
      merge: (persisted, current) => ({
        ...current,
        ...(persisted as object),
        geminiApiKey: (persisted as any)?.geminiApiKey || current.geminiApiKey || import.meta.env.VITE_GEMINI_API_KEY || '',
        openaiApiKey: (persisted as any)?.openaiApiKey || current.openaiApiKey || import.meta.env.VITE_OPENAI_API_KEY || '',
      }),
    }
  )
)

export function getApiKey(): string {
  const { geminiApiKey, openaiApiKey, aiProvider } = useSettingsStore.getState()
  if (aiProvider === 'gemini') return geminiApiKey || import.meta.env.VITE_GEMINI_API_KEY || ''
  return openaiApiKey || import.meta.env.VITE_OPENAI_API_KEY || ''
}

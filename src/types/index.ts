export type Theme = "light" | "dark" | "system"

export type User = {
  id: string
  email: string
  created_at: string
}

export type Project = {
  id: string
  user_id: string
  name: string
  created_at: string
  updated_at: string
}

export type OutputFormat = "whatsapp" | "slack" | "markdown" | "compact" | "plain"

export type AiProvider = "gemini" | "openai"

export type GeneratedReport = {
  id: string
  user_id: string
  project_id: string
  raw_input: string
  generated_output: string
  output_format: OutputFormat
  provider: AiProvider
  created_at: string
  updated_at: string
}

export type GeneratedCommit = {
  id: string
  user_id: string
  project_id: string
  raw_input: string
  generated_output: string
  commit_type: string
  output_format: OutputFormat
  provider: AiProvider
  created_at: string
  updated_at: string
}

export type GeneratedPr = {
  id: string
  user_id: string
  project_id: string
  raw_input: string
  generated_output: string
  output_format: OutputFormat
  provider: AiProvider
  created_at: string
  updated_at: string
}

export type DashboardStats = {
  total_reports: number
  total_commits: number
  total_prs: number
  weekly_reports: number
  weekly_commits: number
  weekly_prs: number
}

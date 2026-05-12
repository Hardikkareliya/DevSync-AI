import { supabase } from './client'
import type { Project, GeneratedReport, GeneratedCommit, GeneratedPr, DashboardStats } from '@/types'

// Projects
export async function fetchProjects(userId: string): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function createProject(userId: string, name: string): Promise<Project> {
  const { data, error } = await supabase
    .from('projects')
    .insert({ user_id: userId, name })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateProject(id: string, name: string): Promise<void> {
  const { error } = await supabase
    .from('projects')
    .update({ name, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw error
}

export async function deleteProject(id: string): Promise<void> {
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// Reports
export async function fetchReports(userId: string, projectId?: string): Promise<GeneratedReport[]> {
  let query = supabase
    .from('reports')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (projectId) {
    query = query.eq('project_id', projectId)
  }

  const { data, error } = await query
  if (error) throw error
  return data || []
}

export async function saveReport(report: Omit<GeneratedReport, 'id' | 'created_at' | 'updated_at'>): Promise<GeneratedReport> {
  const { data, error } = await supabase
    .from('reports')
    .insert(report)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteReport(id: string): Promise<void> {
  const { error } = await supabase
    .from('reports')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// Commits
export async function fetchCommits(userId: string, projectId?: string): Promise<GeneratedCommit[]> {
  let query = supabase
    .from('commits')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (projectId) {
    query = query.eq('project_id', projectId)
  }

  const { data, error } = await query
  if (error) throw error
  return data || []
}

export async function saveCommit(commit: Omit<GeneratedCommit, 'id' | 'created_at' | 'updated_at'>): Promise<GeneratedCommit> {
  const { data, error } = await supabase
    .from('commits')
    .insert(commit)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteCommit(id: string): Promise<void> {
  const { error } = await supabase
    .from('commits')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// PR Descriptions
export async function fetchPrs(userId: string, projectId?: string): Promise<GeneratedPr[]> {
  let query = supabase
    .from('pr_descriptions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (projectId) {
    query = query.eq('project_id', projectId)
  }

  const { data, error } = await query
  if (error) throw error
  return data || []
}

export async function savePr(pr: Omit<GeneratedPr, 'id' | 'created_at' | 'updated_at'>): Promise<GeneratedPr> {
  const { data, error } = await supabase
    .from('pr_descriptions')
    .insert(pr)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deletePr(id: string): Promise<void> {
  const { error } = await supabase
    .from('pr_descriptions')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// Dashboard Stats
export async function fetchDashboardStats(userId: string): Promise<DashboardStats> {
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const [reportsRes, commitsRes, prsRes, weeklyReportsRes, weeklyCommitsRes, weeklyPrsRes] = await Promise.all([
    supabase.from('reports').select('id', { count: 'exact', head: true }).eq('user_id', userId),
    supabase.from('commits').select('id', { count: 'exact', head: true }).eq('user_id', userId),
    supabase.from('pr_descriptions').select('id', { count: 'exact', head: true }).eq('user_id', userId),
    supabase.from('reports').select('id', { count: 'exact', head: true }).eq('user_id', userId).gte('created_at', weekAgo),
    supabase.from('commits').select('id', { count: 'exact', head: true }).eq('user_id', userId).gte('created_at', weekAgo),
    supabase.from('pr_descriptions').select('id', { count: 'exact', head: true }).eq('user_id', userId).gte('created_at', weekAgo),
  ])

  return {
    total_reports: reportsRes.count || 0,
    total_commits: commitsRes.count || 0,
    total_prs: prsRes.count || 0,
    weekly_reports: weeklyReportsRes.count || 0,
    weekly_commits: weeklyCommitsRes.count || 0,
    weekly_prs: weeklyPrsRes.count || 0,
  }
}

// Search history across all tables
export async function searchHistory(userId: string, query: string) {
  const searchPattern = `%${query}%`

  const [reportsRes, commitsRes, prsRes] = await Promise.all([
    supabase.from('reports').select('*, type: raw_input') // raw_input used as identifier
      .eq('user_id', userId)
      .or(`raw_input.ilike.${searchPattern},generated_output.ilike.${searchPattern}`)
      .order('created_at', { ascending: false })
      .limit(20),
    supabase.from('commits').select('*')
      .eq('user_id', userId)
      .or(`raw_input.ilike.${searchPattern},generated_output.ilike.${searchPattern}`)
      .order('created_at', { ascending: false })
      .limit(20),
    supabase.from('pr_descriptions').select('*')
      .eq('user_id', userId)
      .or(`raw_input.ilike.${searchPattern},generated_output.ilike.${searchPattern}`)
      .order('created_at', { ascending: false })
      .limit(20),
  ])

  const results = [
    ...(reportsRes.data?.map(r => ({ ...r, type: 'report' as const })) || []),
    ...(commitsRes.data?.map(c => ({ ...c, type: 'commit' as const })) || []),
    ...(prsRes.data?.map(p => ({ ...p, type: 'pr' as const })) || []),
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  return results
}

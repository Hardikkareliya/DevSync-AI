import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Project } from '@/types'

interface ProjectState {
  projects: Project[]
  activeProjectId: string | null
  setProjects: (projects: Project[]) => void
  setActiveProjectId: (id: string | null) => void
  addProject: (project: Project) => void
  updateProject: (id: string, name: string) => void
  removeProject: (id: string) => void
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set) => ({
      projects: [],
      activeProjectId: null,
      setProjects: (projects) => set({ projects }),
      setActiveProjectId: (activeProjectId) => set({ activeProjectId }),
      addProject: (project) => set((state) => ({ projects: [...state.projects, project] })),
      updateProject: (id, name) =>
        set((state) => ({
          projects: state.projects.map((p) => (p.id === id ? { ...p, name } : p)),
        })),
      removeProject: (id) =>
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
          activeProjectId: state.activeProjectId === id ? null : state.activeProjectId,
        })),
    }),
    { name: 'devsync-projects' }
  )
)

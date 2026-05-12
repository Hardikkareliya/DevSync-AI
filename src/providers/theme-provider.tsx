import { useEffect, type ReactNode } from 'react'
import { useThemeStore } from '@/store/theme-store'

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { theme, setResolvedTheme } = useThemeStore()

  useEffect(() => {
    const root = document.documentElement

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const systemTheme = mediaQuery.matches ? 'dark' : 'light'
      root.classList.toggle('dark', systemTheme === 'dark')
      setResolvedTheme(systemTheme)

      const handler = (e: MediaQueryListEvent) => {
        const newTheme = e.matches ? 'dark' : 'light'
        root.classList.toggle('dark', newTheme === 'dark')
        setResolvedTheme(newTheme)
      }
      mediaQuery.addEventListener('change', handler)
      return () => mediaQuery.removeEventListener('change', handler)
    } else {
      root.classList.toggle('dark', theme === 'dark')
      setResolvedTheme(theme)
    }
  }, [theme, setResolvedTheme])

  return <>{children}</>
}

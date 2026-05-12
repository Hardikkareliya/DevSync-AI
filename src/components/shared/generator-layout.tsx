import type { ReactNode } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface GeneratorLayoutProps {
  title: string
  description: string
  inputSection: ReactNode
  outputSection?: ReactNode
}

export function GeneratorLayout({ title, description, inputSection, outputSection }: GeneratorLayoutProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Input</CardTitle>
          </CardHeader>
          <CardContent>{inputSection}</CardContent>
        </Card>

        {outputSection && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Generated Output</CardTitle>
            </CardHeader>
            <CardContent>{outputSection}</CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

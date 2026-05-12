import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { OutputFormat } from '@/types'

interface OutputFormatSelectorProps {
  value: OutputFormat
  onChange: (value: OutputFormat) => void
}

const formats: { value: OutputFormat; label: string }[] = [
  { value: 'markdown', label: 'Markdown' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'slack', label: 'Slack' },
  { value: 'compact', label: 'Compact' },
  { value: 'plain', label: 'Plain Text' },
]

export function OutputFormatSelector({ value, onChange }: OutputFormatSelectorProps) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as OutputFormat)}>
      <SelectTrigger className="w-36">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {formats.map((f) => (
          <SelectItem key={f.value} value={f.value}>
            {f.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
